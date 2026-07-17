import type { MarketplaceEligibleLot } from "@/contracts/goodco-pantry-mesh.types";
import { isPublishableEligibleLot } from "@/lib/marketplace/eligibility";
import type { MarketplaceListingCreateInput } from "@/lib/marketplace/listing-api";

export function listingGuardrailError(lot: MarketplaceEligibleLot | null, input: MarketplaceListingCreateInput) {
  if (!lot || !isPublishableEligibleLot(lot)) return "This inventory lot is no longer eligible.";
  if (input.quantity > lot.quantityAvailable) return "The requested quantity is no longer available.";
  return null;
}
