import { describe, expect, it } from "vitest";
import { resolvePantryCategory } from "@/lib/categories/taxonomy";

describe("pantry category mapping", () => {
  it("uses correction memory before deterministic rules", () => {
    const suggestion = resolvePantryCategory(
      {
        barcode: "123",
        productName: "Wild canned tuna",
        externalCategory: "seafood",
      },
      [
        {
          matchType: "barcode",
          matchValue: "123",
          category: "canned_meals",
          subcategory: "ready-to-eat fish",
          storageType: "dry",
          confidence: 0.98,
        },
      ],
    );

    expect(suggestion.source).toBe("correction_memory");
    expect(suggestion.category).toBe("canned_meals");
  });

  it("maps product data into pantry categories", () => {
    const suggestion = resolvePantryCategory({
      productName: "Long grain white rice",
      externalCategory: "grains",
      storageType: "dry",
    });

    expect(suggestion.source).toBe("product_data");
    expect(suggestion.category).toBe("grains_and_rice");
  });
});
