import Link from "next/link";
import type { PantryContext } from "@/lib/pantry/context";

export function PantryStatus({ context }: { context: PantryContext }) {
  if (!context.userId) {
    return (
      <Link
        href="/sign-in"
        className="rounded-panel border border-border px-3 py-2 text-sm font-medium transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="min-w-0 text-right">
      <div className="truncate text-sm font-medium">
        {context.activePantry?.name ?? "No pantry"}
      </div>
      <div className="text-xs text-muted">
        {context.activePantry?.approvedStatus ?? "pending"}
      </div>
    </div>
  );
}
