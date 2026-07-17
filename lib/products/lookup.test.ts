import { describe, expect, it } from "vitest";
import { lookupProductByBarcode } from "@/lib/products/lookup";

function response(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

describe("product lookup", () => {
  it("uses Open Food Facts before USDA", async () => {
    const calls: string[] = [];
    const fetcher = async (url: string | URL | Request) => {
      calls.push(String(url));
      return response({
        status: 1,
        product: {
          product_name: "Black Beans",
          brands: "Good Brand",
          quantity: "15 oz",
          categories_tags: ["en:canned-beans"],
        },
      });
    };

    const result = await lookupProductByBarcode("000123456789", {
      fetcher: fetcher as typeof fetch,
      usdaApiKey: "test",
    });

    expect(result.source).toBe("open_food_facts");
    expect(result.name).toBe("Black Beans");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("openfoodfacts");
  });

  it("falls back to USDA when Open Food Facts misses", async () => {
    const calls: string[] = [];
    const fetcher = async (url: string | URL | Request) => {
      calls.push(String(url));
      if (String(url).includes("openfoodfacts")) {
        return response({ status: 0 });
      }
      return response({
        foods: [
          {
            description: "RICE WHITE LONG GRAIN",
            brandOwner: "USDA",
            foodCategory: "Grains",
          },
        ],
      });
    };

    const result = await lookupProductByBarcode("000123456789", {
      fetcher: fetcher as typeof fetch,
      usdaApiKey: "test",
    });

    expect(result.source).toBe("usda_fdc");
    expect(result.name).toBe("RICE WHITE LONG GRAIN");
    expect(calls).toHaveLength(2);
    expect(calls[1]).toContain("api.nal.usda.gov");
  });
});
