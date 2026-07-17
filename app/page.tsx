import { AppShell } from "@/components/app-shell";
import { ReceiveWorkspace } from "@/components/receiving/receive-workspace";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";

export default async function HomePage() {
  const pantryContext = await requireSignedInPantryContext();

  return (
    <AppShell pantryContext={pantryContext}>
      {pantryContext.activePantry ? (
        <ReceiveWorkspace />
      ) : (
        <section className="rounded-panel border border-border bg-surface p-4 text-sm text-muted shadow-panel">
          No pantry access.
        </section>
      )}
    </AppShell>
  );
}
