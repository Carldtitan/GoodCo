import { describe, expect, it } from "vitest";
import { isPublishableEligibleLot, mapEligibleLot } from "@/lib/marketplace/eligibility";

const row = {
  lot_id: "lot-1", pantry_id: "pantry-1", product_id: "product-1", item_name: "Green beans",
  category: "produce" as const, subcategory: null, quantity_available: "12", unit: "lb" as const,
  storage_type: "refrigerated" as const, best_by: null, expiration_date: null, move_by: "2026-07-18",
  lot_code: null, source_type: "retail_rescue" as const, tefap_flag: false, redistribution_allowed: true,
  review_status: "confirmed" as const, availability_confidence: "confirmed" as const,
};

describe("eligible marketplace lots", () => {
  it("maps database rows into the shared contract shape", () => {
    expect(mapEligibleLot(row)).toMatchObject({ lotId: "lot-1", quantityAvailable: 12, moveBy: "2026-07-18" });
  });

  it("requires a confirmed, non-TEFAP, transferable lot with a move-by date", () => {
    expect(isPublishableEligibleLot(mapEligibleLot(row))).toBe(true);
    expect(isPublishableEligibleLot({ ...mapEligibleLot(row), moveBy: undefined })).toBe(false);
    expect(isPublishableEligibleLot({ ...mapEligibleLot(row), tefapFlag: true })).toBe(false);
  });
});
