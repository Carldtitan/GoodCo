import { AppShell } from "@/components/app-shell";
import { listInventoryLotsForPantry } from "@/lib/inventory/queries";
import { getPantryContext } from "@/lib/pantry/context";

export default async function InventoryPage() {
  const pantryContext = await getPantryContext();
  const lots = pantryContext.activePantry
    ? await listInventoryLotsForPantry(pantryContext.activePantry.id)
    : [];

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="rounded-panel border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h1 className="text-xl font-semibold">Inventory</h1>
          <span className="text-sm text-muted">{lots.length}</span>
        </div>

        {lots.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Storage</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Mesh</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const date =
                    lot.expirationDate ?? lot.bestBy ?? lot.moveBy ?? "-";

                  return (
                    <tr key={lot.id} className="border-b border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">{lot.itemName}</div>
                        <div className="text-xs text-muted">{lot.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        {lot.quantityOnHand - lot.quantityReserved} {lot.unit}
                      </td>
                      <td className="px-4 py-3">{lot.storageType}</td>
                      <td className="px-4 py-3">{date}</td>
                      <td className="px-4 py-3">{lot.reviewStatus}</td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "rounded-panel px-2 py-1 text-xs font-medium",
                            lot.marketplaceEligible
                              ? "bg-accent/10 text-accent"
                              : "bg-background text-muted",
                          ].join(" ")}
                        >
                          {lot.marketplaceEligible ? "Eligible" : "No"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-sm text-muted">No inventory.</div>
        )}
      </section>
    </AppShell>
  );
}
