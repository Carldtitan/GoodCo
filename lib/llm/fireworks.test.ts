import { describe, expect, it } from "vitest";
import { parseReceivingWithFireworks } from "@/lib/llm/fireworks";

function response(content: string, ok = true): Response {
  return {
    ok,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  } as Response;
}

describe("Fireworks receiving parser", () => {
  it("accepts valid structured JSON", async () => {
    const result = await parseReceivingWithFireworks(
      { productName: "Rice", externalCategory: "Grains" },
      {
        apiKey: "test",
        model: "test-model",
        fetcher: (async () =>
          response(
            JSON.stringify({
              category: "grains_and_rice",
              subcategory: null,
              storageType: "dry",
              categoryConfidence: 0.91,
              date: null,
            }),
          )) as typeof fetch,
      },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.category).toBe("grains_and_rice");
    }
  });

  it("accepts voice intake fields for no-barcode products", async () => {
    const result = await parseReceivingWithFireworks(
      {
        voiceTranscript:
          "three cases of kiwi Celsius, best by August 12 2026, redistributable",
      },
      {
        apiKey: "test",
        model: "test-model",
        fetcher: (async () =>
          response(
            JSON.stringify({
              itemName: "Kiwi Celsius",
              quantity: 3,
              unit: "case",
              category: "beverages",
              subcategory: "energy drinks",
              storageType: "dry",
              sourceType: "direct_donation",
              redistributionAllowed: true,
              categoryConfidence: 0.9,
              date: {
                normalizedDate: "2026-08-12",
                labelType: "best_by",
                confidence: 0.88,
                rawText: "best by August 12 2026",
              },
            }),
          )) as typeof fetch,
      },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.itemName).toBe("Kiwi Celsius");
      expect(result.draft.quantity).toBe(3);
      expect(result.draft.unit).toBe("case");
      expect(result.draft.redistributionAllowed).toBe(true);
      expect(result.draft.date?.normalizedDate).toBe("2026-08-12");
    }
  });

  it("rejects categories outside the contract", async () => {
    const result = await parseReceivingWithFireworks(
      { productName: "Rice" },
      {
        apiKey: "test",
        model: "test-model",
        fetcher: (async () =>
          response(
            JSON.stringify({
              category: "bulk_magic_food",
              subcategory: null,
              storageType: "dry",
              categoryConfidence: 0.91,
              date: null,
            }),
          )) as typeof fetch,
      },
    );

    expect(result).toEqual({ ok: false, reason: "invalid_schema" });
  });
});
