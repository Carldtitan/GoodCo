import type { ProductLookupResult } from "@/lib/products/types";

type Fetcher = typeof fetch;

type LookupOptions = {
  fetcher?: Fetcher;
  usdaApiKey: string;
};

type OpenFoodFactsResponse = {
  status?: number;
  product?: {
    product_name?: string;
    brands?: string;
    quantity?: string;
    categories_tags?: string[];
    categories?: string;
    ingredients_text?: string;
    allergens_tags?: string[];
  };
};

type UsdaSearchResponse = {
  foods?: Array<{
    description?: string;
    brandOwner?: string;
    packageWeight?: string;
    foodCategory?: string;
    ingredients?: string;
  }>;
};

const OFF_FIELDS = [
  "product_name",
  "brands",
  "quantity",
  "categories",
  "categories_tags",
  "ingredients_text",
  "allergens_tags",
].join(",");

function normalizeBarcode(input: string): string {
  return input.replace(/\D/g, "");
}

function cleanTag(tag: string): string {
  return tag.replace(/^en:/, "").replaceAll("-", " ");
}

function inferStorage(text: string | null): ProductLookupResult["storageType"] {
  const value = text?.toLowerCase() ?? "";

  if (value.includes("frozen")) return "frozen";
  if (
    value.includes("refrigerated") ||
    value.includes("dairy") ||
    value.includes("milk") ||
    value.includes("cheese") ||
    value.includes("yogurt")
  ) {
    return "refrigerated";
  }
  if (value.includes("produce") || value.includes("bread")) {
    return "ambient_short_shelf_life";
  }

  return "dry";
}

function emptyLookup(barcode: string): ProductLookupResult {
  return {
    found: false,
    source: null,
    barcode,
    name: "",
    brand: null,
    packageSize: null,
    categoryText: null,
    storageType: null,
    ingredients: null,
    allergens: [],
    openFoodFactsCategories: [],
    fdcFoodCategory: null,
    pantryCategory: "unknown",
    subcategory: null,
    categoryStorageType: "dry",
    categoryConfidence: 0,
    categorySource: "unknown",
    categoryMatchedBy: null,
  };
}

async function lookupOpenFoodFacts(
  barcode: string,
  fetcher: Fetcher,
): Promise<ProductLookupResult | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${OFF_FIELDS}`;
  const response = await fetcher(url, {
    headers: {
      "User-Agent": "GoodCo/0.1 contact=goodco-local",
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as OpenFoodFactsResponse;
  const product = data.product;
  const name = product?.product_name?.trim();

  if (data.status !== 1 || !product || !name) return null;

  const categories =
    product.categories_tags?.map(cleanTag).filter(Boolean) ??
    product.categories
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ??
    [];
  const categoryText = categories[0] ?? null;

  return {
    found: true,
    source: "open_food_facts",
    barcode,
    name,
    brand: product.brands?.trim() || null,
    packageSize: product.quantity?.trim() || null,
    categoryText,
    storageType: inferStorage(categoryText ?? product.product_name ?? null),
    ingredients: product.ingredients_text?.trim() || null,
    allergens: product.allergens_tags?.map(cleanTag).filter(Boolean) ?? [],
    openFoodFactsCategories: categories,
    fdcFoodCategory: null,
    pantryCategory: "unknown",
    subcategory: null,
    categoryStorageType: "dry",
    categoryConfidence: 0,
    categorySource: "unknown",
    categoryMatchedBy: null,
  };
}

async function lookupUsda(
  barcode: string,
  fetcher: Fetcher,
  usdaApiKey: string,
): Promise<ProductLookupResult | null> {
  const params = new URLSearchParams({
    api_key: usdaApiKey,
    query: barcode,
    pageSize: "5",
  });
  const response = await fetcher(
    `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`,
  );

  if (!response.ok) return null;

  const data = (await response.json()) as UsdaSearchResponse;
  const food = data.foods?.find((item) => item.description?.trim());

  if (!food?.description) return null;

  return {
    found: true,
    source: "usda_fdc",
    barcode,
    name: food.description.trim(),
    brand: food.brandOwner?.trim() || null,
    packageSize: food.packageWeight?.trim() || null,
    categoryText: food.foodCategory?.trim() || null,
    storageType: inferStorage(food.foodCategory ?? food.description),
    ingredients: food.ingredients?.trim() || null,
    allergens: [],
    openFoodFactsCategories: [],
    fdcFoodCategory: food.foodCategory?.trim() || null,
    pantryCategory: "unknown",
    subcategory: null,
    categoryStorageType: "dry",
    categoryConfidence: 0,
    categorySource: "unknown",
    categoryMatchedBy: null,
  };
}

export async function lookupProductByBarcode(
  input: string,
  options: LookupOptions,
): Promise<ProductLookupResult> {
  const barcode = normalizeBarcode(input);

  if (barcode.length < 6) {
    return emptyLookup(barcode);
  }

  const fetcher = options.fetcher ?? fetch;
  const openFoodFacts = await lookupOpenFoodFacts(barcode, fetcher);

  if (openFoodFacts) return openFoodFacts;

  const usda = await lookupUsda(barcode, fetcher, options.usdaApiKey);

  return usda ?? emptyLookup(barcode);
}
