import Link from "next/link";
import { ApprovalButton } from "@/components/approval-button";
import { TransferConfirmationForm } from "@/components/transfer-confirmation-form";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { statusLabel } from "@/lib/marketplace/status";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export default async function MyListingsPage() {
  try {
    const activePantry = await requireActivePantry();
    const supabase = await createRequestSupabaseClient();
    const [{ data: listings, error: listingsError }, { data: requests, error: requestsError }] = await Promise.all([
      supabase.from("marketplace_listings").select("id, item_name, quantity_available, unit, status, move_by, approval_mode").eq("source_pantry_id", activePantry.pantryId).order("created_at", { ascending: false }),
      supabase.from("marketplace_requests").select("id, status, quantity_requested, unit, marketplace_listings!inner(item_name, source_pantry_id)").eq("source_pantry_id", activePantry.pantryId).order("created_at", { ascending: false }),
    ]);
    if (listingsError || requestsError) throw new Error("Could not load your listings.");
    return <section className="py-5"><div className="flex items-center justify-between gap-4"><h1 className="text-xl font-semibold tracking-tight">My Listings</h1><Link className="inline-flex min-h-11 items-center rounded-panel bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/marketplace/listings/new">Publish</Link></div>
      <ul className="mt-5 divide-y divide-border">{(listings ?? []).map((raw) => { const listing = raw as unknown as { id: string; item_name: string; quantity_available: number; unit: string; status: string; move_by: string | null; approval_mode: string }; return <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={listing.id}><div><p className="text-sm font-semibold">{listing.item_name}</p><p className="mt-0.5 text-sm text-muted">{listing.quantity_available} {listing.unit} · move by {listing.move_by ?? "—"}</p></div><span className="rounded-panel bg-background px-2 py-1 text-sm font-medium">{statusLabel(listing.status)}</span></li>; })}</ul>
      {!(listings ?? []).length ? <p className="border-y border-border py-8 text-center text-sm text-muted">No listings</p> : null}
      <section className="mt-7"><h2 className="text-sm font-semibold">Pending approval</h2><ul className="mt-2 divide-y divide-border">{(requests ?? []).filter((request) => request.status === "requested").map((raw) => { const request = raw as unknown as { id: string; status: string; quantity_requested: number; unit: string; marketplace_listings: { item_name: string } | null }; return <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={request.id}><p className="text-sm"><span className="font-medium">{request.marketplace_listings?.item_name ?? "Listing"}</span><span className="text-muted"> · {request.quantity_requested} {request.unit}</span></p><ApprovalButton requestId={request.id} /></li>; })}</ul></section>
      <section className="mt-7"><h2 className="text-sm font-semibold">Ready for pickup</h2><ul className="mt-2 divide-y divide-border">{(requests ?? []).filter((request) => request.status === "approved").map((raw) => { const request = raw as unknown as { id: string; quantity_requested: number; unit: string; marketplace_listings: { item_name: string } | null }; return <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={request.id}><p className="text-sm"><span className="font-medium">{request.marketplace_listings?.item_name ?? "Listing"}</span><span className="text-muted"> · {request.quantity_requested} {request.unit}</span></p><TransferConfirmationForm action="handoff" requestId={request.id} /></li>; })}</ul></section>
    </section>;
  } catch (error) { const message = error instanceof MarketplaceAccessError ? error.message : "Could not load your listings."; return <section className="py-5"><h1 className="text-xl font-semibold tracking-tight">My Listings</h1><p className="mt-6 border-y border-border py-8 text-center text-sm text-muted">{message}</p></section>; }
}
