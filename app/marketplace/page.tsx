import Link from "next/link";
import { ArrowUpRight, PackageSearch } from "lucide-react";

export default function MarketplacePage() {
  return (
    <section className="py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted">Available pantry transfers</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-panel bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          href="/marketplace/listings"
        >
          Publish
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="mt-6 border-y border-border py-12 text-center">
        <PackageSearch aria-hidden="true" className="mx-auto text-muted" size={24} strokeWidth={1.75} />
        <p className="mt-3 text-sm font-medium">No active listings</p>
        <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/marketplace/listings">
          Publish from eligible inventory
        </Link>
      </div>
    </section>
  );
}
