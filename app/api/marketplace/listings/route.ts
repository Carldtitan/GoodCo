import { NextResponse } from "next/server";
import { MarketplaceAccessError, requireActivePantry, requireMarketplaceManager } from "@/lib/marketplace/access";
import { isPublishableEligibleLot, mapEligibleLot } from "@/lib/marketplace/eligibility";
import { listingCreateSchema } from "@/lib/marketplace/listing-api";
import { createRequestSupabaseClient } from "@/lib/supabase/request";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const activePantry = await requireActivePantry();
    requireMarketplaceManager(activePantry);

    const parsed = listingCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the listing details." }, { status: 400 });
    }

    const supabase = await createRequestSupabaseClient();
    const { data: rawLot, error: lotError } = await supabase
      .from("marketplace_eligible_lots")
      .select("*")
      .eq("lot_id", parsed.data.lotId)
      .eq("pantry_id", activePantry.pantryId)
      .maybeSingle();

    if (lotError || !rawLot) {
      return NextResponse.json({ error: "This inventory lot is no longer eligible." }, { status: 409 });
    }

    const lot = mapEligibleLot(rawLot);
    if (!isPublishableEligibleLot(lot) || parsed.data.quantity > lot.quantityAvailable) {
      return NextResponse.json({ error: "This inventory lot is no longer eligible." }, { status: 409 });
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from("marketplace_listings")
      .insert({
        lot_id: lot.lotId,
        source_pantry_id: activePantry.pantryId,
        item_name: lot.itemName,
        category: lot.category,
        subcategory: lot.subcategory ?? null,
        quantity_listed: parsed.data.quantity,
        quantity_available: parsed.data.quantity,
        unit: lot.unit,
        storage_type: lot.storageType,
        best_by: lot.bestBy ?? null,
        expiration_date: lot.expirationDate ?? null,
        move_by: lot.moveBy,
        pickup_window_start: parsed.data.pickupWindowStart,
        pickup_window_end: parsed.data.pickupWindowEnd,
        approval_mode: parsed.data.approvalMode,
        price_cents: 0,
        payment_required: false,
        restriction_status: "none",
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Could not publish this listing." }, { status: 500 });
    }

    return NextResponse.json({ listingId: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not publish this listing." }, { status: 500 });
  }
}
