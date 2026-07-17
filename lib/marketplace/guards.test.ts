import { describe, expect, it } from "vitest";
import { canCreateMarketplaceListing, activeListingsFromRealLots } from "./guards";
import type { MarketplaceEligibleLot } from "@/contracts/goodco-pantry-mesh.types";

const eligibleLot: MarketplaceEligibleLot = {
  lotId: "lot",
  pantryId: "pantry",
  productId: "product",
  itemName: "Rice",
  category: "grains_and_rice",
  quantityAvailable: 10,
  unit: "case",
  storageType: "dry",
  sourceType: "direct_donation",
  tefapFlag: false,
  redistributionAllowed: true,
  reviewStatus: "confirmed",
  availabilityConfidence: "confirmed",
};

describe("no synthetic marketplace guard", () => {
  it("prevents listings without an eligible inventory lot", () => {
    expect(canCreateMarketplaceListing(null, 1)).toBe(false);
    expect(canCreateMarketplaceListing(undefined, 1)).toBe(false);
    expect(canCreateMarketplaceListing(eligibleLot, 11)).toBe(false);
    expect(canCreateMarketplaceListing(eligibleLot, 4)).toBe(true);
  });

  it("renders no active marketplace supply without real lot ids", () => {
    expect(
      activeListingsFromRealLots([
        { lotId: null, status: "active", itemName: "Synthetic item" },
        { lotId: "lot", status: "cancelled", itemName: "Cancelled item" },
      ]),
    ).toEqual([]);
  });
});
