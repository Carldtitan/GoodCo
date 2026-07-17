import { NextResponse } from "next/server";
import { canApproveRequest } from "@/lib/marketplace/approval";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const activePantry = await requireActivePantry();
    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from("marketplace_requests")
      .select("id, listing_id, source_pantry_id, status, marketplace_listings(approval_mode, restriction_status)")
      .eq("id", requestId)
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    const requestRow = data as unknown as { id: string; listing_id: string; source_pantry_id: string; status: string; marketplace_listings: { approval_mode: string; restriction_status: string } | null };
    if (requestRow.status !== "requested" || !requestRow.marketplace_listings) return NextResponse.json({ error: "This request cannot be approved." }, { status: 409 });
    const { data: policy } = activePantry.networkId ? await serviceClient.from("network_policies").select("require_admin_approval").eq("network_id", activePantry.networkId).maybeSingle() : { data: null };
    const requiresAdmin = requestRow.marketplace_listings.restriction_status === "admin_required" || (policy?.require_admin_approval ?? true);
    if (!canApproveRequest({ role: activePantry.role, activePantryId: activePantry.pantryId, sourcePantryId: requestRow.source_pantry_id, approvalMode: requestRow.marketplace_listings.approval_mode, requiresAdmin })) {
      return NextResponse.json({ error: "You cannot approve this request." }, { status: 403 });
    }
    const { error: updateError } = await serviceClient.from("marketplace_requests").update({ status: "approved", approved_by: activePantry.userId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", requestRow.id);
    if (updateError) return NextResponse.json({ error: "Could not approve this request." }, { status: 500 });
    if (activePantry.networkId) await serviceClient.from("marketplace_policy_decisions").insert({ network_id: activePantry.networkId, listing_id: requestRow.listing_id, request_id: requestRow.id, decision: "approved", reason: "Approved by the required reviewer.", actor_id: activePantry.userId });
    return NextResponse.json({ status: "approved" });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not approve this request." }, { status: 500 });
  }
}
