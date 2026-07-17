import { AppShell } from "@/components/app-shell";
import { getPantryContext } from "@/lib/pantry/context";

export default async function InventoryPage() {
  const pantryContext = await getPantryContext();

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="rounded-panel border border-border bg-surface p-4 shadow-panel">
        <h1 className="text-xl font-semibold">Inventory</h1>
      </section>
    </AppShell>
  );
}
