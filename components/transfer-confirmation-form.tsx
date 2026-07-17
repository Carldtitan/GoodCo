"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TransferConfirmationFormProps = {
  requestId: string;
  action: "handoff" | "receipt";
};

export function TransferConfirmationForm({ requestId, action }: TransferConfirmationFormProps) {
  const router = useRouter();
  const [temperature, setTemperature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isHandoff = action === "handoff";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/marketplace/requests/${requestId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(temperature ? { [isHandoff ? "temperatureAtPickup" : "temperatureAtReceipt"]: temperature } : {}),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not save this transfer update.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save this transfer update.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={submit}>
      <label className="grid gap-1 text-xs font-medium text-muted">
        Temperature °{isHandoff ? "F" : "F"}
        <input className="min-h-11 w-24 rounded-panel border border-border bg-surface px-2 text-sm text-foreground" inputMode="decimal" onChange={(event) => setTemperature(event.target.value)} step="0.1" type="number" value={temperature} />
      </label>
      <button className="min-h-11 rounded-panel bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={pending} type="submit">
        {pending ? "Saving…" : isHandoff ? "Confirm pickup" : "Confirm receipt"}
      </button>
      {error ? <p aria-live="polite" className="basis-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
