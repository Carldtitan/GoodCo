import type {
  PantryCategory,
  StorageType,
} from "@/contracts/goodco-pantry-mesh.types";

export type CategorySource =
  | "correction_memory"
  | "product_data"
  | "llm_parse"
  | "rules"
  | "unknown";

export type CategoryMappingRecord = {
  matchType:
    | "barcode"
    | "product_name"
    | "brand_product"
    | "ocr_phrase"
    | "keyword_rule";
  matchValue: string;
  category: PantryCategory;
  subcategory: string | null;
  storageType: StorageType;
  confidence: number | null;
};

export type CategoryInput = {
  barcode?: string | null;
  productName?: string | null;
  brand?: string | null;
  externalCategory?: string | null;
  storageType?: StorageType | null;
  ocrText?: string | null;
};

export type CategorySuggestion = {
  category: PantryCategory;
  subcategory: string | null;
  storageType: StorageType;
  confidence: number;
  source: CategorySource;
  matchedBy: string | null;
};

const keywordRules: Array<{
  keywords: string[];
  category: PantryCategory;
  subcategory: string | null;
  storageType: StorageType;
}> = [
  {
    keywords: ["fresh produce", "vegetable", "fruit", "apple", "banana"],
    category: "produce",
    subcategory: null,
    storageType: "ambient_short_shelf_life",
  },
  {
    keywords: ["milk", "yogurt", "cheese", "dairy"],
    category: "dairy",
    subcategory: null,
    storageType: "refrigerated",
  },
  {
    keywords: ["egg"],
    category: "eggs",
    subcategory: null,
    storageType: "refrigerated",
  },
  {
    keywords: ["chicken", "turkey", "poultry"],
    category: "poultry",
    subcategory: null,
    storageType: "frozen",
  },
  {
    keywords: ["beef", "pork", "meat"],
    category: "meat",
    subcategory: null,
    storageType: "frozen",
  },
  {
    keywords: ["fish", "seafood", "shrimp", "tuna"],
    category: "seafood",
    subcategory: null,
    storageType: "frozen",
  },
  {
    keywords: ["black beans", "pinto beans", "kidney beans", "canned beans"],
    category: "canned_beans",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["canned vegetable", "corn", "green beans"],
    category: "canned_vegetables",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["canned fruit", "peaches", "pears"],
    category: "canned_fruit",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["rice", "grain", "oat", "quinoa"],
    category: "grains_and_rice",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["pasta", "noodle", "macaroni"],
    category: "pasta_and_noodles",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["cereal", "breakfast"],
    category: "cereal_and_breakfast",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["bread", "bakery", "bagel", "tortilla"],
    category: "bread_and_bakery",
    subcategory: null,
    storageType: "ambient_short_shelf_life",
  },
  {
    keywords: ["diaper", "baby wipes"],
    category: "diapers_and_baby_supplies",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["soap", "toothpaste", "shampoo", "hygiene"],
    category: "hygiene",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["pet food", "dog food", "cat food"],
    category: "pet_food",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["sauce", "condiment", "ketchup", "mustard"],
    category: "condiments_and_sauces",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["flour", "sugar", "baking"],
    category: "baking_goods",
    subcategory: null,
    storageType: "dry",
  },
  {
    keywords: ["frozen"],
    category: "frozen_food",
    subcategory: null,
    storageType: "frozen",
  },
];

function normalize(value: string | null | undefined): string {
  return value
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim() ?? "";
}

function brandProduct(input: CategoryInput): string {
  return normalize(`${input.brand ?? ""} ${input.productName ?? ""}`);
}

function mappingMatches(
  mapping: CategoryMappingRecord,
  input: CategoryInput,
): boolean {
  const target = normalize(mapping.matchValue);

  if (!target) return false;

  switch (mapping.matchType) {
    case "barcode":
      return normalize(input.barcode) === target;
    case "brand_product":
      return brandProduct(input) === target;
    case "product_name":
      return normalize(input.productName).includes(target);
    case "ocr_phrase":
      return normalize(input.ocrText).includes(target);
    case "keyword_rule":
      return [
        input.productName,
        input.externalCategory,
        input.ocrText,
      ].some((value) => normalize(value).includes(target));
  }
}

function fromMapping(mapping: CategoryMappingRecord): CategorySuggestion {
  return {
    category: mapping.category,
    subcategory: mapping.subcategory,
    storageType: mapping.storageType,
    confidence: mapping.confidence ?? 0.95,
    source: "correction_memory",
    matchedBy: `${mapping.matchType}:${mapping.matchValue}`,
  };
}

export function resolvePantryCategory(
  input: CategoryInput,
  mappings: CategoryMappingRecord[] = [],
): CategorySuggestion {
  const mapping = mappings.find((candidate) =>
    mappingMatches(candidate, input),
  );

  if (mapping) {
    return fromMapping(mapping);
  }

  const external = normalize(input.externalCategory);
  const text = normalize(
    [
      input.productName,
      input.brand,
      input.externalCategory,
      input.ocrText,
    ]
      .filter(Boolean)
      .join(" "),
  );

  for (const rule of keywordRules) {
    if (rule.keywords.some((keyword) => text.includes(normalize(keyword)))) {
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        storageType: input.storageType ?? rule.storageType,
        confidence: external ? 0.78 : 0.68,
        source: external ? "product_data" : "rules",
        matchedBy: rule.keywords.find((keyword) =>
          text.includes(normalize(keyword)),
        ) ?? null,
      };
    }
  }

  return {
    category: "unknown",
    subcategory: null,
    storageType: input.storageType ?? "dry",
    confidence: 0.2,
    source: "unknown",
    matchedBy: null,
  };
}

export function shouldUseFireworksCategoryFallback(
  suggestion: Pick<CategorySuggestion, "source" | "confidence">,
): boolean {
  return suggestion.source === "unknown" || suggestion.confidence < 0.65;
}
