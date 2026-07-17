import { describe, expect, it } from "vitest";
import { listingGuardrailError } from "@/lib/marketplace/listing-guardrails";
import type { MarketplaceEligibleLot } from "@/contracts/goodco-pantry-mesh.types";

const lot: MarketplaceEligibleLot = {
  lotId: "00000000-0000-4000-8000-000000000001", pantryId: "00000000-0000-4000-8000-000000000002", productId: "00000000-0000-4000-8000-000000000003",
  itemName: "Canned beans", category: "canned_beans", quantityAvailable: 8, unit: "case", storageType: "dry", moveBy: "2026-07-23",
  sourceType: "food_bank", tefapFlag: false, redistributionAllowed: true, reviewStatus: "confirmed", availabilityConfidence: "confirmed",
};
const input = { lotId: lot.lotId, quantity: 4, pickupWindowStart: "2026-07-20T09:00:00.000Z", pickupWindowEnd: "2026-07-20T10:00:00.000Z", approvalMode: "source_pantry_approval" as const };

describe("listing creation guardrails", () => {
  it("blocks a listing without an eligible inventory lot", () => {
    expect(listingGuardrailError(null, input)).toBe("This inventory lot is no longer eligible.");
    expect(listingGuardrailError({ ...lot, moveBy: undefined }, input)).toBe("This inventory lot is no longer eligible.");
  });

  it("blocks a quantity above the live eligible amount", () => {
    expect(listingGuardrailError(lot, { ...input, quantity: 9 })).toBe("The requested quantity is no longer available.");
  });

  it("allows a confirmed, redistributable, non-TEFAP lot", () => {
    expect(listingGuardrailError(lot, input)).toBeNull();
  });
});
