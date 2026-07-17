import Link from "next/link";
import { ArrowLeft, CalendarClock, MapPin, PackageCheck, Thermometer } from "lucide-react";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

type ListingDetailPageProps = { params: Promise<{ listingId: string }> };

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { listingId } = await params;

  try {
    await requireActivePantry();
    const supabase = await createRequestSupabaseClient();
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, pantries(name, county, address, contact_name, contact_phone), inventory_lots(lot_code, source_type, received_at, date_source, date_review_status)")
      .eq("id", listingId)
      .maybeSingle();

    if (error) throw new Error("Could not load this listing.");
    if (!data) return <NotFound />;

    const row = data as unknown as {
      item_name: string; category: string; quantity_available: number; unit: string; storage_type: string;
      move_by: string | null; best_by: string | null; expiration_date: string | null; pickup_window_start: string; pickup_window_end: string;
      approval_mode: string; restriction_status: string; pantries: { name: string; county: string; address: string; contact_name: string | null; contact_phone: string | null } | null;
      inventory_lots: { lot_code: string | null; source_type: string | null; received_at: string | null; date_source: string | null; date_review_status: string | null } | null;
    };
    const pantry = row.pantries;
    const lot = row.inventory_lots;

    return (
      <section className="py-5">
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/marketplace">
          <ArrowLeft aria-hidden="true" size={16} /> Marketplace
        </Link>
        <div className="mt-4 border-b border-border pb-5">
          <p className="text-sm text-muted">{row.category.replaceAll("_", " ")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{row.item_name}</h1>
          <p className="mt-2 text-base font-medium">{row.quantity_available} {row.unit} available</p>
        </div>

        <dl className="grid divide-y divide-border text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex gap-3 py-4 sm:pr-5">
            <Thermometer aria-hidden="true" className="mt-0.5 shrink-0 text-muted" size={17} />
            <div><dt className="text-muted">Storage</dt><dd className="mt-0.5 font-medium capitalize">{row.storage_type.replaceAll("_", " ")}</dd></div>
          </div>
          <div className="flex gap-3 py-4 sm:pl-5">
            <CalendarClock aria-hidden="true" className="mt-0.5 shrink-0 text-muted" size={17} />
            <div><dt className="text-muted">Move by</dt><dd className="mt-0.5 font-medium">{row.move_by ?? "Not available"}</dd></div>
          </div>
          <div className="flex gap-3 py-4 sm:pr-5">
            <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-muted" size={17} />
            <div><dt className="text-muted">Pickup</dt><dd className="mt-0.5 font-medium">{pantry?.name ?? "Source pantry"} · {pantry?.county ?? ""}</dd><dd className="mt-0.5 text-muted">{new Date(row.pickup_window_start).toLocaleString()} – {new Date(row.pickup_window_end).toLocaleString()}</dd></div>
          </div>
          <div className="flex gap-3 py-4 sm:pl-5">
            <PackageCheck aria-hidden="true" className="mt-0.5 shrink-0 text-muted" size={17} />
            <div><dt className="text-muted">Approval</dt><dd className="mt-0.5 font-medium capitalize">{row.approval_mode.replaceAll("_", " ")}</dd></div>
          </div>
        </dl>

        <section className="mt-6 max-w-2xl border-t border-border pt-5">
          <h2 className="text-sm font-semibold">Traceability</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-muted">Lot</dt><dd className="mt-0.5 font-medium">{lot?.lot_code ?? "Not recorded"}</dd></div>
            <div><dt className="text-muted">Source</dt><dd className="mt-0.5 font-medium capitalize">{lot?.source_type?.replaceAll("_", " ") ?? "Not recorded"}</dd></div>
            <div><dt className="text-muted">Date source</dt><dd className="mt-0.5 font-medium capitalize">{lot?.date_source?.replaceAll("_", " ") ?? "Not recorded"}</dd></div>
            <div><dt className="text-muted">Date review</dt><dd className="mt-0.5 font-medium capitalize">{lot?.date_review_status?.replaceAll("_", " ") ?? "Not recorded"}</dd></div>
          </dl>
        </section>
      </section>
    );
  } catch (error) {
    const message = error instanceof MarketplaceAccessError ? error.message : "Could not load this listing.";
    return <section className="py-5"><p className="border-y border-border py-8 text-center text-sm text-muted">{message}</p></section>;
  }
}

function NotFound() {
  return <section className="py-5"><p className="border-y border-border py-8 text-center text-sm text-muted">Listing not found</p></section>;
}
