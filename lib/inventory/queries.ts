import type { PantryCategory, StorageType, Unit } from "@/contracts/goodco-pantry-mesh.types";
import { isEligibleForMarketplace } from "@/lib/inventory/eligibility";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type InventoryListItem = {
  id: string;
  itemName: string;
  category: PantryCategory;
  quantityOnHand: number;
  quantityReserved: number;
  unit: Unit;
  storageType: StorageType;
  bestBy: string | null;
  expirationDate: string | null;
  moveBy: string | null;
  dateReviewStatus: string;
  reviewStatus: "confirmed" | "needs_review";
  redistributionAllowed: boolean;
  tefapFlag: boolean;
  marketplaceEligible: boolean;
};

type InventoryLotRow = {
  id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  unit: Unit;
  storage_type: StorageType;
  best_by: string | null;
  expiration_date: string | null;
  move_by: string | null;
  date_review_status: string;
  review_status: "confirmed" | "needs_review";
  redistribution_allowed: boolean;
  tefap_flag: boolean;
  products: {
    name: string;
    category: PantryCategory;
  } | null;
};

export async function listInventoryLotsForPantry(
  pantryId: string,
): Promise<InventoryListItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("inventory_lots")
    .select(
      "id, quantity_on_hand, quantity_reserved, unit, storage_type, best_by, expiration_date, move_by, date_review_status, review_status, redistribution_allowed, tefap_flag, products(name, category)",
    )
    .eq("pantry_id", pantryId)
    .order("updated_at", { ascending: false })
    .returns<InventoryLotRow[]>();

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    itemName: row.products?.name ?? "Unnamed item",
    category: row.products?.category ?? "unknown",
    quantityOnHand: Number(row.quantity_on_hand),
    quantityReserved: Number(row.quantity_reserved),
    unit: row.unit,
    storageType: row.storage_type,
    bestBy: row.best_by,
    expirationDate: row.expiration_date,
    moveBy: row.move_by,
    dateReviewStatus: row.date_review_status,
    reviewStatus: row.review_status,
    redistributionAllowed: row.redistribution_allowed,
    tefapFlag: row.tefap_flag,
    marketplaceEligible: isEligibleForMarketplace({
      quantityOnHand: Number(row.quantity_on_hand),
      quantityReserved: Number(row.quantity_reserved),
      reviewStatus: row.review_status,
      redistributionAllowed: row.redistribution_allowed,
      tefapFlag: row.tefap_flag,
    }),
  }));
}
