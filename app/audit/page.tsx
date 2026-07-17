import { GitBranch } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  listClassificationAudit,
  listTransferAudit,
} from "@/lib/audit/queries";
import { getPantryContext } from "@/lib/pantry/context";

export default async function AuditPage() {
  const pantryContext = await getPantryContext();
  const [corrections, transfers] = await Promise.all([
    listClassificationAudit(),
    pantryContext.activePantry
      ? listTransferAudit(pantryContext.activePantry.id)
      : Promise.resolve([]),
  ]);

  return (
    <AppShell pantryContext={pantryContext}>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-panel border border-border bg-surface shadow-panel">
          <div className="border-b border-border p-4">
            <h1 className="text-xl font-semibold">Corrections</h1>
          </div>
          {corrections.length ? (
            <div className="divide-y divide-border">
              {corrections.map((item) => (
                <div key={item.id} className="p-4 text-sm">
                  <div className="font-medium">
                    {item.productName ?? "Unknown"}
                  </div>
                  <div className="mt-1 text-muted">
                    {item.suggestedCategory ?? "unknown"} -{" "}
                    {item.finalCategory ?? "unknown"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted">No corrections.</div>
          )}
        </section>

        <section className="rounded-panel border border-border bg-surface shadow-panel">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <GitBranch aria-hidden="true" size={18} />
            <h1 className="text-xl font-semibold">Transfers</h1>
          </div>
          {transfers.length ? (
            <div className="divide-y divide-border">
              {transfers.map((item) => (
                <div key={item.id} className="grid gap-1 p-4 text-sm">
                  <div className="font-medium">
                    {item.quantityTransferred} {item.unit}
                  </div>
                  <div className="text-xs text-muted">
                    {item.sourceLotId} - {item.destinationLotId ?? "pending"}
                  </div>
                  <div className="text-xs text-muted">
                    {item.completedAt ?? "open"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted">No transfers.</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
