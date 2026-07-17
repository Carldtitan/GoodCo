"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RequestListingFormProps = { listingId: string; quantityAvailable: number; unit: string };

export function RequestListingForm({ listingId, quantityAvailable, unit }: RequestListingFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/marketplace/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity, ...(pickupTime ? { requestedPickupTime: new Date(pickupTime).toISOString() } : {}) }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not send this request."); return; }
      router.push("/marketplace/requests");
      router.refresh();
    } catch {
      setError("Could not send this request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-6 max-w-2xl border-t border-border pt-5" onSubmit={onSubmit}>
      <h2 className="text-sm font-semibold">Request</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Quantity ({unit})
          <input className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" inputMode="decimal" max={quantityAvailable} min="0" onChange={(event) => setQuantity(event.target.value)} required type="number" value={quantity} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Pickup time
          <input className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" onChange={(event) => setPickupTime(event.target.value)} type="datetime-local" value={pickupTime} />
        </label>
      </div>
      {error ? <p aria-live="polite" className="mt-3 text-sm font-medium text-danger">{error}</p> : null}
      <button className="mt-4 inline-flex min-h-11 items-center justify-center rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={saving} type="submit">{saving ? "Sending…" : "Send request"}</button>
    </form>
  );
}
