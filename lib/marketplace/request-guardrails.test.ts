import { describe, expect, it } from "vitest";
import { requestGuardrailError } from "@/lib/marketplace/request-guardrails";

const listing = { sourcePantryId: "source", quantityAvailable: 5, storageType: "refrigerated" as const, status: "active", moveBy: "2026-07-22", restrictionStatus: "none" };
const input = { requestingPantryId: "requester", storageCapabilities: ["refrigerated" as const], quantity: 2, listing, today: "2026-07-17" };

describe("marketplace request lifecycle guardrails", () => {
  it("rejects source-pantries, expired listings, unavailable quantities, and missing storage", () => {
    expect(requestGuardrailError({ ...input, requestingPantryId: "source" })).toContain("another pantry");
    expect(requestGuardrailError({ ...input, listing: { ...listing, moveBy: "2026-07-16" } })).toContain("no longer available");
    expect(requestGuardrailError({ ...input, quantity: 6 })).toContain("no longer available");
    expect(requestGuardrailError({ ...input, storageCapabilities: ["dry"] })).toContain("does not support");
  });

  it("allows a compatible request for an active listing", () => {
    expect(requestGuardrailError(input)).toBeNull();
  });
});
