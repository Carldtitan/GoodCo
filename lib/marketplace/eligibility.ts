import type {
  MarketplaceEligibleLot,
  ReviewStatus,
  SourceType,
  StorageType,
  Unit,
} from "@/contracts/goodco-pantry-mesh.types";

type EligibleLotRow = {
  lot_id: string;
  pantry_id: string;
  product_id: string;
  item_name: string;
  category: MarketplaceEligibleLot["category"];
  subcategory: string | null;
  quantity_available: number | string;
  unit: Unit;
  storage_type: StorageType;
  best_by: string | null;
  expiration_date: string | null;
  move_by: string | null;
  lot_code: string | null;
  source_type: SourceType;
  tefap_flag: boolean;
  redistribution_allowed: boolean;
  review_status: ReviewStatus;
  availability_confidence: MarketplaceEligibleLot["availabilityConfidence"];
};

export function isPublishableEligibleLot(lot: MarketplaceEligibleLot): boolean {
  return (
    lot.reviewStatus === "confirmed" &&
    lot.redistributionAllowed &&
    !lot.tefapFlag &&
    lot.quantityAvailable > 0 &&
    Boolean(lot.moveBy)
  );
}

export function mapEligibleLot(row: EligibleLotRow): MarketplaceEligibleLot {
  return {
    lotId: row.lot_id,
    pantryId: row.pantry_id,
    productId: row.product_id,
    itemName: row.item_name,
    category: row.category,
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
    quantityAvailable: Number(row.quantity_available),
    unit: row.unit,
    storageType: row.storage_type,
    ...(row.best_by ? { bestBy: row.best_by } : {}),
    ...(row.expiration_date ? { expirationDate: row.expiration_date } : {}),
    ...(row.move_by ? { moveBy: row.move_by } : {}),
    ...(row.lot_code ? { lotCode: row.lot_code } : {}),
    sourceType: row.source_type,
    tefapFlag: row.tefap_flag,
    redistributionAllowed: row.redistribution_allowed,
    reviewStatus: row.review_status,
    availabilityConfidence: row.availability_confidence,
  };
}
