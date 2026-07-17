import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";

export function requestGuardrailError(input: {
  requestingPantryId: string;
  storageCapabilities: StorageType[];
  quantity: number;
  listing: { sourcePantryId: string; quantityAvailable: number; storageType: StorageType; status: string; moveBy: string | null; restrictionStatus: string };
  today?: string;
}) {
  if (input.listing.sourcePantryId === input.requestingPantryId) return "Choose a listing from another pantry.";
  if (input.listing.status !== "active" || !input.listing.moveBy || input.listing.moveBy < (input.today ?? new Date().toISOString().slice(0, 10)) || input.listing.quantityAvailable < input.quantity) return "This listing is no longer available.";
  if (!input.storageCapabilities.includes(input.listing.storageType)) return "Your pantry does not support this storage requirement.";
  if (input.listing.restrictionStatus === "blocked") return "This item is restricted by network policy.";
  return null;
}
