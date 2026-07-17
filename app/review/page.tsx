import { AppShell } from "@/components/app-shell";
import {
  PANTRY_CATEGORIES,
  STORAGE_TYPES,
} from "@/contracts/goodco-pantry-mesh.constants";
import { listClassificationReviewItems } from "@/lib/categories/review";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";
import { approveCategoryMapping } from "./actions";

export default async function ReviewPage() {
  const pantryContext = await requireSignedInPantryContext();
  const items = pantryContext.activePantry
    ? await listClassificationReviewItems()
    : [];

  return (
    <AppShell pantryContext={pantryContext}>
      <section className="rounded-panel border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h1 className="text-xl font-semibold">Review</h1>
          <span className="text-sm text-muted">{items.length}</span>
        </div>

        {items.length ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <form
                key={item.id}
                action={approveCategoryMapping}
                className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_7rem]"
              >
                <input type="hidden" name="eventId" value={item.id} />
                <input
                  type="hidden"
                  name="barcode"
                  value={item.barcode ?? ""}
                />
                <input
                  type="hidden"
                  name="productName"
                  value={item.productName ?? ""}
                />
                <div>
                  <div className="font-medium">
                    {item.productName ?? item.barcode ?? "Unknown"}
                  </div>
                  <div className="text-xs text-muted">
                    {item.suggestedCategory ?? "unknown"} -{" "}
                    {Math.round((item.confidence ?? 0) * 100)}%
                  </div>
                </div>
                <label className="grid gap-1 text-sm font-medium">
                  Category
                  <select
                    name="category"
                    defaultValue={item.suggestedCategory ?? "unknown"}
                    className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {PANTRY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Storage
                  <select
                    name="storageType"
                    defaultValue="dry"
                    className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {STORAGE_TYPES.map((storageType) => (
                      <option key={storageType} value={storageType}>
                        {storageType}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="self-end rounded-panel bg-foreground px-4 py-2 text-sm font-semibold text-surface transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Approve
                </button>
              </form>
            ))}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted">Nothing to review.</div>
        )}
      </section>
    </AppShell>
  );
}
