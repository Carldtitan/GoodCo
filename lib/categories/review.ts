import type { PantryCategory, StorageType } from "@/contracts/goodco-pantry-mesh.types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type ClassificationReviewItem = {
  id: string;
  barcode: string | null;
  productName: string | null;
  suggestedCategory: PantryCategory | null;
  confidence: number | null;
  modelOrRuleUsed: string | null;
};

type ClassificationReviewRow = {
  id: string;
  barcode: string | null;
  product_name: string | null;
  suggested_category: PantryCategory | null;
  confidence: number | null;
  model_or_rule_used: string | null;
};

export async function listClassificationReviewItems(): Promise<
  ClassificationReviewItem[]
> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("classification_events")
    .select("id, barcode, product_name, suggested_category, confidence, model_or_rule_used")
    .or("suggested_category.eq.unknown,confidence.lt.0.65")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ClassificationReviewRow[]>();

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    barcode: row.barcode,
    productName: row.product_name,
    suggestedCategory: row.suggested_category,
    confidence: row.confidence,
    modelOrRuleUsed: row.model_or_rule_used,
  }));
}

export async function createApprovedCategoryMapping(input: {
  pantryId: string;
  userId: string;
  eventId: string;
  barcode: string | null;
  productName: string | null;
  category: PantryCategory;
  storageType: StorageType;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const matchType = input.barcode ? "barcode" : "product_name";
  const matchValue = input.barcode ?? input.productName ?? "";

  if (!matchValue) {
    throw new Error("match_value_required");
  }

  await supabase.from("category_mappings").insert({
    scope: "local",
    pantry_id: input.pantryId,
    match_type: matchType,
    match_value: matchValue,
    category: input.category,
    storage_type: input.storageType,
    confidence: 1,
    created_by: input.userId,
    approved_by: input.userId,
  });

  await supabase
    .from("classification_events")
    .update({
      final_category: input.category,
      was_corrected: true,
      corrected_by: input.userId,
    })
    .eq("id", input.eventId);
}
