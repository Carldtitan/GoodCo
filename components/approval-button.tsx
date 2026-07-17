"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function approve() {
    setPending(true); setError(null);
    const response = await fetch(`/api/marketplace/requests/${requestId}/approval`, { method: "POST" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error ?? "Could not approve this request.");
    else router.refresh();
    setPending(false);
  }
  return <div className="flex items-center gap-2"><button className="inline-flex min-h-11 items-center rounded-panel bg-accent px-3 text-sm font-semibold text-white disabled:opacity-60" disabled={pending} onClick={approve} type="button">{pending ? "Approving…" : "Approve"}</button>{error ? <span className="text-sm text-danger">{error}</span> : null}</div>;
}
