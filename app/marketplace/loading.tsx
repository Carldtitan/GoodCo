export default function MarketplaceLoading() {
  return (
    <section aria-label="Loading marketplace" className="py-5">
      <div className="h-7 w-32 animate-pulse rounded-panel bg-border" />
      <div className="mt-5 h-11 animate-pulse rounded-panel bg-border" />
      <div className="mt-4 space-y-4">
        {["first", "second", "third"].map((key) => <div className="h-16 animate-pulse border-b border-border bg-surface" key={key} />)}
      </div>
    </section>
  );
}
