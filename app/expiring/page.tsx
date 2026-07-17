import { AppShell } from "@/components/app-shell";
import { listInventoryLotsForPantry } from "@/lib/inventory/queries";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";

function relevantDate(lot: {
  moveBy: string | null;
  expirationDate: string | null;
  bestBy: string | null;
}) {
  return lot.moveBy ?? lot.expirationDate ?? lot.bestBy;
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const today = new Date();
  const target = new Date(`${date}T00:00:00Z`);
  const start = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  return Math.ceil((target.getTime() - start) / 86_400_000);
}

export default async function ExpiringPage() {
  const pantryContext = await requireSignedInPantryContext();
  const lots = pantryContext.activePantry
    ? await listInventoryLotsForPantry(pantryContext.activePantry.id)
    : [];
  const urgent = lots
    .map((lot) => ({
      ...lot,
      relevantDate: relevantDate(lot),
      days: daysUntil(relevantDate(lot)),
    }))
    .filter((lot) => lot.relevantDate)
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="rounded-panel border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h1 className="text-xl font-semibold">Expiring</h1>
          <span className="text-sm text-muted">{urgent.length}</span>
        </div>

        {urgent.length ? (
          <div className="divide-y divide-border">
            {urgent.map((lot) => (
              <div
                key={lot.id}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_8rem_9rem_7rem]"
              >
                <div>
                  <div className="font-medium">{lot.itemName}</div>
                  <div className="text-xs text-muted">{lot.category}</div>
                </div>
                <div className="text-sm">{lot.storageType}</div>
                <div className="text-sm">{lot.relevantDate}</div>
                <div
                  className={[
                    "text-sm font-medium",
                    lot.days !== null && lot.days <= 2
                      ? "text-danger"
                      : "text-muted",
                  ].join(" ")}
                >
                  {lot.days === null
                    ? "-"
                    : lot.days < 0
                      ? "Past"
                      : `${lot.days}d`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted">No dated lots.</div>
        )}
      </section>
    </AppShell>
  );
}
