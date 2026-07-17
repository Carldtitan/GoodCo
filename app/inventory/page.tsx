import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { listInventoryLotsForPantry } from "@/lib/inventory/queries";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";

export default async function InventoryPage() {
  const pantryContext = await requireSignedInPantryContext();
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
                        {lot.marketplaceEligible ? (
                          <Link
                            className="inline-flex min-h-9 items-center rounded-panel bg-accent px-3 text-xs font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            href={`/marketplace/listings/new?lotId=${lot.id}`}
                          >
                            Publish
                          </Link>
                        ) : (
                          <span className="rounded-panel bg-background px-2 py-1 text-xs font-medium text-muted">
                            No
                          </span>
                        )}
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
