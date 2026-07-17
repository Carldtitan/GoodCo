import type { MarketplaceEligibleLot } from "@/contracts/goodco-pantry-mesh.types";

export function canCreateMarketplaceListing(
  eligibleLot: MarketplaceEligibleLot | null | undefined,
  quantityListed: number,
): boolean {
  return Boolean(
    eligibleLot &&
      quantityListed > 0 &&
      quantityListed <= eligibleLot.quantityAvailable &&
      eligibleLot.reviewStatus === "confirmed" &&
      eligibleLot.redistributionAllowed &&
      !eligibleLot.tefapFlag,
  );
}

export function activeListingsFromRealLots<
  T extends { lotId: string | null; status: string },
>(listings: T[]): T[] {
  return listings.filter(
    (listing) => listing.status === "active" && Boolean(listing.lotId),
  );
}
