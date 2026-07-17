import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { CancelRequestButton } from "@/components/cancel-request-button";
import { statusLabel } from "@/lib/marketplace/status";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export default async function MyRequestsPage() {
  try {
    const activePantry = await requireActivePantry();
    const supabase = await createRequestSupabaseClient();
    const { data, error } = await supabase
      .from("marketplace_requests")
      .select("id, quantity_requested, unit, status, requested_pickup_time, marketplace_listings!inner(item_name, move_by, storage_type), pantries!marketplace_requests_source_pantry_id_fkey(name)")
      .eq("requesting_pantry_id", activePantry.pantryId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your requests.");
    return <section className="py-5"><h1 className="text-xl font-semibold tracking-tight">My Requests</h1><ul className="mt-5 divide-y divide-border">{(data ?? []).map((raw) => { const request = raw as unknown as { id: string; quantity_requested: number; unit: string; status: string; requested_pickup_time: string | null; marketplace_listings: { item_name: string; move_by: string | null; storage_type: string } | null; pantries: { name: string } | null }; return <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={request.id}><div><p className="text-sm font-semibold">{request.marketplace_listings?.item_name ?? "Listing"}</p><p className="mt-0.5 text-sm text-muted">{request.quantity_requested} {request.unit} · {request.pantries?.name ?? "Source pantry"}{request.requested_pickup_time ? ` · pickup ${new Date(request.requested_pickup_time).toLocaleString()}` : ""}</p></div><div className="flex items-center gap-2"><span className="rounded-panel bg-background px-2 py-1 text-sm font-medium">{statusLabel(request.status)}</span>{["requested", "approved"].includes(request.status) ? <CancelRequestButton requestId={request.id} /> : null}</div></li>; })}</ul>{!(data ?? []).length ? <p className="border-y border-border py-8 text-center text-sm text-muted">No requests</p> : null}</section>;
  } catch (error) { const message = error instanceof MarketplaceAccessError ? error.message : "Could not load your requests."; return <section className="py-5"><h1 className="text-xl font-semibold tracking-tight">My Requests</h1><p className="mt-6 border-y border-border py-8 text-center text-sm text-muted">{message}</p></section>; }
}
