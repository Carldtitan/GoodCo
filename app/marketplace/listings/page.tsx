import Link from "next/link";

export default function MyListingsPage() {
  return (
    <section className="py-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">My Listings</h1>
        <Link className="inline-flex min-h-11 items-center rounded-panel bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/marketplace/listings/new">
          Publish
        </Link>
      </div>
      <p className="mt-8 border-y border-border py-8 text-center text-sm text-muted">No listings</p>
    </section>
  );
}
