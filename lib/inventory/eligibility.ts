import {
  isMarketplaceEligibleLot,
  type MarketplaceEligibleLot,
} from "@/contracts/goodco-pantry-mesh.types";

export type EligibleLotRow = {
  lot_id: string;
  pantry_id: string;
  product_id: string;
  item_name: string;
  category: MarketplaceEligibleLot["category"];
  subcategory: string | null;
  quantity_available: number;
  unit: MarketplaceEligibleLot["unit"];
  storage_type: MarketplaceEligibleLot["storageType"];
  best_by: string | null;
  expiration_date: string | null;
  move_by: string | null;
  lot_code: string | null;
  source_type: MarketplaceEligibleLot["sourceType"];
  tefap_flag: boolean;
  redistribution_allowed: boolean;
  review_status: MarketplaceEligibleLot["reviewStatus"];
  availability_confidence: MarketplaceEligibleLot["availabilityConfidence"];
};

export function mapEligibleLotRow(row: EligibleLotRow): MarketplaceEligibleLot {
  return {
    lotId: row.lot_id,
    pantryId: row.pantry_id,
    productId: row.product_id,
    itemName: row.item_name,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    quantityAvailable: Number(row.quantity_available),
    unit: row.unit,
    storageType: row.storage_type,
    bestBy: row.best_by ?? undefined,
    expirationDate: row.expiration_date ?? undefined,
    moveBy: row.move_by ?? undefined,
    lotCode: row.lot_code ?? undefined,
    sourceType: row.source_type,
    tefapFlag: row.tefap_flag,
    redistributionAllowed: row.redistribution_allowed,
    reviewStatus: row.review_status,
    availabilityConfidence: row.availability_confidence,
  };
}

export function isEligibleForMarketplace(input: {
  quantityOnHand: number;
  quantityReserved: number;
  reviewStatus: "confirmed" | "needs_review";
  redistributionAllowed: boolean;
  tefapFlag: boolean;
}): boolean {
  return isMarketplaceEligibleLot(input);
}
