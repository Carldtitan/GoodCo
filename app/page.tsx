import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
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
