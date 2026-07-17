"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MarketplaceEligibleLot } from "@/contracts/goodco-pantry-mesh.types";

type PublishListingFormProps = {
  lots: MarketplaceEligibleLot[];
};

function toLocalInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function PublishListingForm({ lots }: PublishListingFormProps) {
  const router = useRouter();
  const [lotId, setLotId] = useState(lots[0]?.lotId ?? "");
  const [quantity, setQuantity] = useState("");
  const [pickupStart, setPickupStart] = useState(() => toLocalInputValue(new Date()));
  const [pickupEnd, setPickupEnd] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [approvalMode, setApprovalMode] = useState("source_pantry_approval");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedLot = lots.find((lot) => lot.lotId === lotId);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId,
          quantity,
          pickupWindowStart: new Date(pickupStart).toISOString(),
          pickupWindowEnd: new Date(pickupEnd).toISOString(),
          approvalMode,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not publish this listing.");
        return;
      }

      router.push("/marketplace/listings");
      router.refresh();
    } catch {
      setError("Could not publish this listing.");
    } finally {
      setSaving(false);
    }
  }

  if (!lots.length) {
    return <p className="mt-8 border-y border-border py-8 text-center text-sm text-muted">No eligible inventory</p>;
  }

  return (
    <form className="mt-5 grid max-w-2xl gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-sm font-medium">
        Inventory lot
        <select className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" value={lotId} onChange={(event) => setLotId(event.target.value)}>
          {lots.map((lot) => (
            <option key={lot.lotId} value={lot.lotId}>
              {lot.itemName} · {lot.quantityAvailable} {lot.unit} · move by {lot.moveBy}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Quantity {selectedLot ? `(${selectedLot.unit})` : ""}
          <input className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" inputMode="decimal" min="0" max={selectedLot?.quantityAvailable} name="quantity" required type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Approval
          <select className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" value={approvalMode} onChange={(event) => setApprovalMode(event.target.value)}>
            <option value="auto_approve">Auto approve</option>
            <option value="source_pantry_approval">Source approval</option>
            <option value="network_admin_approval">Admin approval</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Pickup starts
          <input className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" required type="datetime-local" value={pickupStart} onChange={(event) => setPickupStart(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Pickup ends
          <input className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" required type="datetime-local" value={pickupEnd} onChange={(event) => setPickupEnd(event.target.value)} />
        </label>
      </div>

      {error ? <p aria-live="polite" className="text-sm font-medium text-danger">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button className="inline-flex min-h-11 items-center justify-center rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={saving} type="submit">
          {saving ? "Publishing…" : "Publish"}
        </button>
        {selectedLot?.moveBy ? <p className="text-sm text-muted">Move by {selectedLot.moveBy}</p> : null}
      </div>
    </form>
  );
}
