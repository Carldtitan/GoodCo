import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { CategoryMappingRecord } from "@/lib/categories/taxonomy";

type LoadCategoryMappingsInput = {
  pantryId?: string | null;
  networkId?: string | null;
};

type CategoryMappingRow = {
  match_type: CategoryMappingRecord["matchType"];
  match_value: string;
  category: CategoryMappingRecord["category"];
  subcategory: string | null;
  storage_type: CategoryMappingRecord["storageType"];
  confidence: number | null;
};

export async function loadCategoryMappings({
  pantryId,
  networkId,
}: LoadCategoryMappingsInput): Promise<CategoryMappingRecord[]> {
  const supabase = createServiceRoleSupabaseClient();
  const clauses = ["scope.eq.base_catalog"];

  if (pantryId) clauses.push(`pantry_id.eq.${pantryId}`);
  if (networkId) clauses.push(`network_id.eq.${networkId}`);

  const { data, error } = await supabase
    .from("category_mappings")
    .select(
      "match_type, match_value, category, subcategory, storage_type, confidence",
    )
    .or(clauses.join(","))
    .limit(500)
    .returns<CategoryMappingRow[]>();

  if (error) return [];

  return (data ?? []).map((row) => ({
    matchType: row.match_type,
    matchValue: row.match_value,
    category: row.category,
    subcategory: row.subcategory,
    storageType: row.storage_type,
    confidence: row.confidence,
  }));
}
