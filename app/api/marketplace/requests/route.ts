import { NextResponse } from "next/server";
import type { StorageType, Unit } from "@/contracts/goodco-pantry-mesh.types";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { toReservationRpc } from "@/lib/marketplace/inventory-api";
import { marketplaceRequestSchema } from "@/lib/marketplace/request-api";
import { requestGuardrailError } from "@/lib/marketplace/request-guardrails";
import { createRequestSupabaseClient } from "@/lib/supabase/request";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const activePantry = await requireActivePantry();
    const parsed = marketplaceRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Check the requested quantity and pickup time." }, { status: 400 });

    const supabase = await createRequestSupabaseClient();
    const { data: rawListing, error: listingError } = await supabase
      .from("marketplace_listings")
      .select("id, lot_id, source_pantry_id, category, quantity_available, unit, storage_type, status, approval_mode, restriction_status, move_by")
      .eq("id", parsed.data.listingId)
      .maybeSingle();
    if (listingError || !rawListing) return NextResponse.json({ error: "This listing is not available." }, { status: 404 });

    const listing = rawListing as unknown as {
      id: string; lot_id: string; source_pantry_id: string; category: string; quantity_available: number | string; unit: Unit; storage_type: StorageType;
      status: string; approval_mode: "auto_approve" | "source_pantry_approval" | "network_admin_approval"; restriction_status: "none" | "admin_required" | "blocked"; move_by: string | null;
    };
    const guardrailError = requestGuardrailError({ requestingPantryId: activePantry.pantryId, storageCapabilities: activePantry.storageCapabilities, quantity: parsed.data.quantity, listing: { sourcePantryId: listing.source_pantry_id, quantityAvailable: Number(listing.quantity_available), storageType: listing.storage_type, status: listing.status, moveBy: listing.move_by, restrictionStatus: listing.restriction_status } });
    if (guardrailError) return NextResponse.json({ error: guardrailError }, { status: guardrailError.includes("restricted") ? 403 : guardrailError.includes("another pantry") ? 400 : 409 });

    const serviceClient = createServiceRoleSupabaseClient();
    const { data: policy } = activePantry.networkId
      ? await serviceClient.from("network_policies").select("require_admin_approval, restricted_categories").eq("network_id", activePantry.networkId).maybeSingle()
      : { data: null };
    if ((policy?.restricted_categories ?? []).includes(listing.category)) return NextResponse.json({ error: "This item is restricted by network policy." }, { status: 403 });

    const needsAdmin = listing.approval_mode === "network_admin_approval" || listing.restriction_status === "admin_required" || (policy?.require_admin_approval ?? true);
    const requestStatus = listing.approval_mode === "auto_approve" && !needsAdmin ? "approved" : "requested";
    const { data: createdRequest, error: requestError } = await serviceClient
      .from("marketplace_requests")
      .insert({
        listing_id: listing.id,
        requesting_pantry_id: activePantry.pantryId,
        source_pantry_id: listing.source_pantry_id,
        quantity_requested: parsed.data.quantity,
        unit: listing.unit,
        status: requestStatus,
        requested_pickup_time: parsed.data.requestedPickupTime ?? null,
        ...(requestStatus === "approved" ? { approved_by: activePantry.userId, approved_at: new Date().toISOString() } : {}),
      })
      .select("id")
      .single();
    if (requestError || !createdRequest) return NextResponse.json({ error: "Could not create this request." }, { status: 500 });

    const { error: reservationError } = await serviceClient.rpc("reserve_marketplace_inventory", toReservationRpc({
      listingId: listing.id, requestId: createdRequest.id, lotId: listing.lot_id, quantity: parsed.data.quantity, unit: listing.unit,
    }, activePantry.userId));
    if (reservationError) {
      await serviceClient.from("marketplace_requests").delete().eq("id", createdRequest.id);
      return NextResponse.json({ error: reservationError.message }, { status: 409 });
    }

    if (activePantry.networkId) {
      await serviceClient.from("marketplace_policy_decisions").insert({
        network_id: activePantry.networkId, listing_id: listing.id, request_id: createdRequest.id,
        decision: needsAdmin ? "admin_required" : requestStatus === "approved" ? "approved" : "allowed",
        reason: needsAdmin ? "Network policy requires approval." : "Request meets listing and storage requirements.", actor_id: activePantry.userId,
      });
    }

    return NextResponse.json({ requestId: createdRequest.id, status: requestStatus }, { status: 201 });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not create this request." }, { status: 500 });
  }
}
