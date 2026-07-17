"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Apple, Beef, Milk, Package, Snowflake, UtensilsCrossed, Wheat } from "lucide-react";
import type { MarketplaceListingView } from "@/lib/marketplace/listing-view";
import { moveByTone } from "@/lib/marketplace/listing-view";

export type MarketplaceBrowseListing = MarketplaceListingView & { distance: number | null };

type MarketplaceBrowseProps = { listings: MarketplaceBrowseListing[] };

function CategoryIcon({ category }: { category: string }) {
  const Icon = category.includes("produce") ? Apple
    : category.includes("dairy") || category.includes("eggs") ? Milk
      : category.includes("meat") || category.includes("poultry") || category.includes("seafood") ? Beef
        : category.includes("frozen") ? Snowflake
          : category.includes("grain") || category.includes("pasta") || category.includes("bread") ? Wheat
            : category.includes("prepared") ? UtensilsCrossed
              : Package;
  return <Icon aria-hidden="true" size={19} strokeWidth={1.8} />;
}

function toneClass(tone: ReturnType<typeof moveByTone>) {
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  return "text-muted";
}

export function MarketplaceBrowse({ listings }: MarketplaceBrowseProps) {
  const [search, setSearch] = useState("");
  const [storage, setStorage] = useState("all");
  const [county, setCounty] = useState("all");
  const counties = [...new Set(listings.map((listing) => listing.sourcePantry.county))].sort();

  const results = useMemo(() => listings.filter((listing) => {
    const query = search.trim().toLocaleLowerCase();
    return (!query || `${listing.itemName} ${listing.category} ${listing.sourcePantry.name}`.toLocaleLowerCase().includes(query))
      && (storage === "all" || listing.storageType === storage)
      && (county === "all" || listing.sourcePantry.county === county);
  }), [county, listings, search, storage]);

  return (
    <section className="py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted">Available pantry transfers</p>
        </div>
        <Link className="inline-flex min-h-11 items-center rounded-panel bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/marketplace/listings/new">Publish</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-y border-border py-3">
        <label className="sr-only" htmlFor="marketplace-search">Search listings</label>
        <input className="min-h-11 min-w-48 flex-1 rounded-panel border border-border bg-surface px-3 text-sm" id="marketplace-search" onChange={(event) => setSearch(event.target.value)} placeholder="Search food or pantry" type="search" value={search} />
        <label className="sr-only" htmlFor="marketplace-storage">Storage</label>
        <select className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" id="marketplace-storage" onChange={(event) => setStorage(event.target.value)} value={storage}>
          <option value="all">All storage</option>
          <option value="dry">Dry</option>
          <option value="refrigerated">Refrigerated</option>
          <option value="frozen">Frozen</option>
          <option value="ambient_short_shelf_life">Short shelf life</option>
        </select>
        <label className="sr-only" htmlFor="marketplace-county">County</label>
        <select className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" id="marketplace-county" onChange={(event) => setCounty(event.target.value)} value={county}>
          <option value="all">All counties</option>
          {counties.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      {results.length ? (
        <ul className="divide-y divide-border">
          {results.map((listing) => {
            const tone = moveByTone(listing.moveBy);
            return (
              <li className="grid gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center" key={listing.id}>
                <div className="flex size-10 items-center justify-center rounded-panel bg-background text-foreground"><CategoryIcon category={listing.category} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{listing.itemName}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">{listing.sourcePantry.name} · {listing.sourcePantry.county}{listing.distance == null ? "" : ` · ${listing.distance} mi`}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
                  <span className="text-sm font-medium">{listing.quantityAvailable} {listing.unit}</span>
                  <span className="text-sm text-muted capitalize">{listing.storageType.replaceAll("_", " ")}</span>
                  <span className={`text-sm font-medium ${toneClass(tone)}`}>Move by {listing.moveBy}</span>
                  <Link className="inline-flex min-h-11 items-center rounded-panel border border-border px-3 text-sm font-semibold transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href={`/marketplace/listings/${listing.id}`}>Request</Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="border-b border-border py-10 text-center text-sm text-muted">{listings.length ? "No matching listings" : "No active listings"}</p>
      )}
    </section>
  );
}
