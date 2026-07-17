import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";

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
};
