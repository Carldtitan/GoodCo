import { Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EXPORT_DATASETS } from "@/lib/export/datasets";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";

export default async function ExportsPage() {
  const pantryContext = await requireSignedInPantryContext();

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="rounded-panel border border-border bg-surface shadow-panel">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-semibold">Exports</h1>
        </div>
        <div className="divide-y divide-border">
          {EXPORT_DATASETS.map((dataset) => (
            <a
              key={dataset}
              href={`/api/exports/${dataset}`}
              className="flex items-center justify-between gap-4 p-4 text-sm transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="font-medium">{dataset}</span>
              <Download aria-hidden="true" size={17} />
            </a>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
