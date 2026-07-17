import { AppShell } from "@/components/app-shell";
import { getPantryContext } from "@/lib/pantry/context";

export default async function HomePage() {
  const pantryContext = await getPantryContext();

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="grid gap-4">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
          <h1 className="text-xl font-semibold">Receive</h1>
          <p className="mt-1 max-w-prose text-sm text-muted">
            Scan or enter food as it arrives.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
