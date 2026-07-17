import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type ClassificationAuditItem = {
  id: string;
  productName: string | null;
  suggestedCategory: string | null;
  finalCategory: string | null;
  correctedBy: string | null;
  createdAt: string;
};

export type TransferAuditItem = {
  id: string;
  sourceLotId: string;
  destinationLotId: string | null;
  sourcePantryId: string;
  destinationPantryId: string;
  quantityTransferred: number;
  unit: string;
  completedAt: string | null;
};

type ClassificationAuditRow = {
  id: string;
  product_name: string | null;
  suggested_category: string | null;
  final_category: string | null;
  corrected_by: string | null;
  created_at: string;
};

type TransferAuditRow = {
  id: string;
  source_lot_id: string;
  destination_lot_id: string | null;
  source_pantry_id: string;
  destination_pantry_id: string;
  quantity_transferred: number;
  unit: string;
  completed_at: string | null;
};

export async function listClassificationAudit(): Promise<
  ClassificationAuditItem[]
> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("classification_events")
    .select(
      "id, product_name, suggested_category, final_category, corrected_by, created_at",
    )
    .eq("was_corrected", true)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ClassificationAuditRow[]>();

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    productName: row.product_name,
    suggestedCategory: row.suggested_category,
    finalCategory: row.final_category,
    correctedBy: row.corrected_by,
    createdAt: row.created_at,
  }));
}

export async function listTransferAudit(
  pantryId: string,
): Promise<TransferAuditItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("marketplace_transfers")
    .select(
      "id, source_lot_id, destination_lot_id, source_pantry_id, destination_pantry_id, quantity_transferred, unit, completed_at",
    )
    .or(`source_pantry_id.eq.${pantryId},destination_pantry_id.eq.${pantryId}`)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<TransferAuditRow[]>();

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    sourceLotId: row.source_lot_id,
    destinationLotId: row.destination_lot_id,
    sourcePantryId: row.source_pantry_id,
    destinationPantryId: row.destination_pantry_id,
    quantityTransferred: Number(row.quantity_transferred),
    unit: row.unit,
    completedAt: row.completed_at,
  }));
}
