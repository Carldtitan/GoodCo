import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";
import type {
  CategorySource,
  CategorySuggestion,
} from "@/lib/categories/taxonomy";

export type ProductLookupSource = "open_food_facts" | "usda_fdc";

export type ProductLookupResult = {
  found: boolean;
  source: ProductLookupSource | null;
  barcode: string;
  name: string;
  brand: string | null;
  packageSize: string | null;
  categoryText: string | null;
  storageType: StorageType | null;
  ingredients: string | null;
  allergens: string[];
  openFoodFactsCategories: string[];
  fdcFoodCategory: string | null;
  pantryCategory: CategorySuggestion["category"];
  subcategory: string | null;
  categoryStorageType: StorageType;
  categoryConfidence: number;
  categorySource: CategorySource;
  categoryMatchedBy: string | null;
};
