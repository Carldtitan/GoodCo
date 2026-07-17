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
