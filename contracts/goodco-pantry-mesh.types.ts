export type PantryCategory =
  | "produce"
  | "dairy"
  | "eggs"
  | "meat"
  | "poultry"
  | "seafood"
  | "plant_protein"
  | "canned_meals"
  | "canned_vegetables"
  | "canned_fruit"
  | "canned_beans"
  | "grains_and_rice"
  | "pasta_and_noodles"
  | "cereal_and_breakfast"
  | "bread_and_bakery"
  | "snacks"
  | "beverages"
  | "baby_food"
  | "infant_formula"
  | "diapers_and_baby_supplies"
  | "hygiene"
  | "household"
  | "pet_food"
  | "prepared_meals"
  | "frozen_food"
  | "refrigerated_prepared_food"
  | "condiments_and_sauces"
  | "baking_goods"
  | "spices_and_seasonings"
  | "unknown";

export type StorageType =
  | "dry"
  | "refrigerated"
  | "frozen"
  | "ambient_short_shelf_life";

export type Unit = "each" | "case" | "box" | "lb" | "oz" | "gal";

export type SourceType =
  | "food_bank"
  | "retail_rescue"
  | "direct_donation"
  | "purchased"
  | "unknown";

export type ReviewStatus = "confirmed" | "needs_review";
export type AvailabilityConfidence = "confirmed" | "likely" | "stale";
export type ApprovalMode =
  | "auto_approve"
  | "source_pantry_approval"
  | "network_admin_approval";
export type ListingStatus =
  | "active"
  | "reserved"
  | "pending_approval"
  | "fulfilled"
  | "expired"
  | "cancelled";
export type RequestStatus =
  | "requested"
  | "approved"
  | "ready_for_pickup"
  | "picked_up"
  | "received"
  | "cancelled"
  | "rejected";
export type MovementType =
  | "receiving"
  | "manual_adjustment"
  | "distribution"
  | "marketplace_reserved"
  | "marketplace_transferred"
  | "marketplace_cancelled";

export type DateLabelType =
  | "best_by"
  | "use_by"
  | "sell_by"
  | "expires"
  | "packed_on"
  | "produced_on"
  | "unknown";

export type DateSource =
  | "gs1_barcode"
  | "ocr"
  | "voice"
  | "llm_parse"
  | "manual"
  | "default_rule";

export type DateReviewStatus =
  | "confirmed"
  | "draft_high_confidence"
  | "needs_review"
  | "missing"
  | "not_applicable";

export interface Pantry {
  id: string;
  networkId: string | null;
  name: string;
  county: string;
  address: string;
  lat: number | null;
  lng: number | null;
  contactName: string | null;
  contactPhone: string | null;
  approvedStatus: "pending" | "approved" | "suspended";
  storageCapabilities: StorageType[];
}

export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  packageSize: string | null;
  category: PantryCategory;
  subcategory: string | null;
  storageType: StorageType;
  ingredients: string | null;
  allergens: string[];
  source: "open_food_facts" | "usda_fdc" | "manual" | "correction_memory";
  gpcSegment: string | null;
  gpcFamily: string | null;
  gpcClass: string | null;
  gpcBrick: string | null;
  openFoodFactsCategories: string[];
  fdcFoodCategory: string | null;
}

export interface InventoryLot {
  id: string;
  productId: string;
  pantryId: string;
  quantityOnHand: number;
  quantityReserved: number;
  unit: Unit;
  sourceType: SourceType;
  receivedAt: string;
  bestBy: string | null;
  useBy: string | null;
  sellBy: string | null;
  expirationDate: string | null;
  productionDate: string | null;
  packagingDate: string | null;
  moveBy: string | null;
  dateLabelType: DateLabelType;
  dateRawText: string | null;
  dateVoiceTranscript: string | null;
  dateSource: DateSource | null;
  dateConfidence: number | null;
  dateReviewStatus: DateReviewStatus;
  lotCode: string | null;
  storageType: StorageType;
  tefapFlag: boolean;
  redistributionAllowed: boolean;
  confidence: number | null;
  reviewStatus: ReviewStatus;
}

export interface InventoryMovement {
  id: string;
  lotId: string;
  movementType: MovementType;
  quantityDelta: number;
  unit: Unit;
  actorId: string;
  marketplaceListingId: string | null;
  marketplaceRequestId: string | null;
  createdAt: string;
  note: string | null;
}

export interface MarketplaceEligibleLot {
  lotId: string;
  pantryId: string;
  productId: string;
  itemName: string;
  category: PantryCategory;
  subcategory?: string;
  quantityAvailable: number;
  unit: Unit;
  storageType: StorageType;
  bestBy?: string;
  expirationDate?: string;
  moveBy?: string;
  lotCode?: string;
  sourceType: SourceType;
  tefapFlag: boolean;
  redistributionAllowed: boolean;
  reviewStatus: ReviewStatus;
  availabilityConfidence: AvailabilityConfidence;
}

export interface MarketplaceListing {
  id: string;
  lotId: string;
  sourcePantryId: string;
  itemName: string;
  category: PantryCategory;
  subcategory: string | null;
  quantityListed: number;
  quantityAvailable: number;
  unit: Unit;
  storageType: StorageType;
  bestBy: string | null;
  expirationDate: string | null;
  moveBy: string | null;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  photoUrl: string | null;
  status: ListingStatus;
  approvalMode: ApprovalMode;
  priceCents: number;
  paymentRequired: boolean;
  restrictionStatus: "none" | "admin_required" | "blocked";
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceRequest {
  id: string;
  listingId: string;
  requestingPantryId: string;
  sourcePantryId: string;
  quantityRequested: number;
  unit: Unit;
  status: RequestStatus;
  requestedPickupTime: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceTransfer {
  id: string;
  requestId: string;
  listingId: string;
  sourceLotId: string;
  destinationLotId: string | null;
  sourcePantryId: string;
  destinationPantryId: string;
  quantityTransferred: number;
  unit: Unit;
  handoffConfirmedBy: string | null;
  receiptConfirmedBy: string | null;
  temperatureAtPickup: number | null;
  temperatureAtReceipt: number | null;
  photoUrl: string | null;
  completedAt: string | null;
}

export interface NetworkPolicy {
  id: string;
  networkId: string;
  allowTefapTransfer: boolean;
  allowPaidTransfer: boolean;
  requireAdminApproval: boolean;
  restrictedCategories: PantryCategory[];
  maxListingAgeHours: number;
  defaultListingExpirationHours: number;
}

export interface MarketplaceMovement {
  movementType:
    | "marketplace_reserved"
    | "marketplace_transferred"
    | "marketplace_cancelled";
  listingId: string;
  lotId: string;
  fromPantryId: string;
  toPantryId: string;
  quantityDelta: number;
  unit: Unit;
  actorId: string;
  timestamp: string;
  note?: string;
}

export function isMarketplaceEligibleLot(
  lot: Pick<
    InventoryLot,
    | "quantityOnHand"
    | "quantityReserved"
    | "reviewStatus"
    | "redistributionAllowed"
    | "tefapFlag"
  >,
): boolean {
  return (
    lot.reviewStatus === "confirmed" &&
    lot.redistributionAllowed === true &&
    lot.tefapFlag === false &&
    lot.quantityOnHand - lot.quantityReserved > 0
  );
}
