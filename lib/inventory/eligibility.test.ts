import { describe, expect, it } from "vitest";
import { isEligibleForMarketplace } from "@/lib/inventory/eligibility";

describe("marketplace eligibility", () => {
  it("accepts confirmed redistributable non-TEFAP inventory with available quantity", () => {
    expect(
      isEligibleForMarketplace({
        quantityOnHand: 10,
        quantityReserved: 2,
        reviewStatus: "confirmed",
        redistributionAllowed: true,
        tefapFlag: false,
      }),
    ).toBe(true);
  });

  it("excludes unconfirmed, TEFAP, non-redistributable, and zero-available lots", () => {
    const base = {
      quantityOnHand: 10,
      quantityReserved: 0,
      reviewStatus: "confirmed" as const,
      redistributionAllowed: true,
      tefapFlag: false,
    };

    expect(
      isEligibleForMarketplace({ ...base, reviewStatus: "needs_review" }),
    ).toBe(false);
    expect(isEligibleForMarketplace({ ...base, tefapFlag: true })).toBe(false);
    expect(
      isEligibleForMarketplace({ ...base, redistributionAllowed: false }),
    ).toBe(false);
    expect(
      isEligibleForMarketplace({
        ...base,
        quantityOnHand: 4,
        quantityReserved: 4,
      }),
    ).toBe(false);
  });
});
