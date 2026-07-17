import Link from "next/link";
import { MarketplaceBrowse, type MarketplaceBrowseListing } from "@/components/marketplace-browse";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { expireMarketplaceListings } from "@/lib/marketplace/listing-lifecycle";
import { distanceMiles } from "@/lib/marketplace/listing-view";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export default async function MarketplacePage() {
  try {
    const activePantry = await requireActivePantry();
    await expireMarketplaceListings();
    const supabase = await createRequestSupabaseClient();
    const { data: currentPantry } = await supabase.from("pantries").select("lat, lng").eq("id", activePantry.pantryId).maybeSingle();
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, pantries(name, county, address, contact_name, contact_phone, lat, lng), inventory_lots(lot_code, source_type, received_at, date_source, date_review_status)")
      .eq("status", "active")
      .gt("pickup_window_end", new Date().toISOString())
      .order("move_by", { ascending: true });

    if (error) throw new Error("Could not load marketplace listings.");

    const listings = (data ?? []).map((raw) => {
      const row = raw as unknown as { id: string; lot_id: string; item_name: string; category: MarketplaceBrowseListing["category"]; quantity_available: number | string; unit: MarketplaceBrowseListing["unit"]; storage_type: MarketplaceBrowseListing["storageType"]; move_by: string | null; pickup_window_start: string; pickup_window_end: string; status: string; approval_mode: string; restriction_status: string; pantries: MarketplaceBrowseListing["sourcePantry"]; inventory_lots: MarketplaceBrowseListing["traceability"] };
      return {
        id: row.id, lotId: row.lot_id, itemName: row.item_name, category: row.category, quantityAvailable: Number(row.quantity_available), unit: row.unit, storageType: row.storage_type,
        moveBy: row.move_by, pickupWindowStart: row.pickup_window_start, pickupWindowEnd: row.pickup_window_end, status: row.status, approvalMode: row.approval_mode, restrictionStatus: row.restriction_status,
        sourcePantry: row.pantries, traceability: row.inventory_lots,
        distance: distanceMiles(currentPantry ?? { lat: null, lng: null }, row.pantries),
      } satisfies MarketplaceBrowseListing;
    });

    return <MarketplaceBrowse listings={listings} />;
  } catch (error) {
    const message = error instanceof MarketplaceAccessError ? error.message : "Could not load marketplace listings.";
    return (
      <section className="py-5">
        <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-6 border-y border-border py-8 text-center text-sm text-muted">{message}</p>
        {error instanceof MarketplaceAccessError && error.status === 401 ? <Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/sign-in">Sign in</Link> : null}
      </section>
    );
  }
}
