import { z } from "zod";
import {
  DATE_LABEL_TYPES,
  PANTRY_CATEGORIES,
  STORAGE_TYPES,
} from "@/contracts/goodco-pantry-mesh.constants";

type Fetcher = typeof fetch;

const fireworksDraftSchema = z.object({
  category: z.enum(PANTRY_CATEGORIES),
  subcategory: z.string().trim().min(1).nullable(),
  storageType: z.enum(STORAGE_TYPES),
  categoryConfidence: z.number().min(0).max(1),
  date: z
    .object({
      normalizedDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
      labelType: z.enum(DATE_LABEL_TYPES),
      confidence: z.number().min(0).max(1),
      rawText: z.string().nullable(),
    })
    .nullable(),
});

export type FireworksReceivingDraft = z.infer<typeof fireworksDraftSchema>;

export type FireworksParseInput = {
  barcode?: string | null;
  productName?: string | null;
  brand?: string | null;
  externalCategory?: string | null;
  dateRawText?: string | null;
};

type FireworksOptions = {
  apiKey: string;
  model: string;
  fetcher?: Fetcher;
};

type FireworksResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function jsonOnly(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildPrompt(input: FireworksParseInput): string {
  return [
    "Classify pantry receiving data as strict JSON.",
    "Use only the allowed enum values.",
    "Return no prose.",
    JSON.stringify({
      allowedCategories: PANTRY_CATEGORIES,
      allowedStorageTypes: STORAGE_TYPES,
      allowedDateLabels: DATE_LABEL_TYPES,
      input,
      outputShape: {
        category: "PantryCategory",
        subcategory: "string|null",
        storageType: "StorageType",
        categoryConfidence: "number 0..1",
        date: {
          normalizedDate: "YYYY-MM-DD|null",
          labelType: "DateLabelType",
          confidence: "number 0..1",
          rawText: "string|null",
        },
      },
    }),
  ].join("\n");
}

export async function parseReceivingWithFireworks(
  input: FireworksParseInput,
  options: FireworksOptions,
): Promise<
  | { ok: true; draft: FireworksReceivingDraft }
  | { ok: false; reason: "request_failed" | "invalid_json" | "invalid_schema" }
> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You convert food pantry receiving inputs into validated inventory draft fields.",
          },
          { role: "user", content: buildPrompt(input) },
        ],
      }),
    },
  );

  if (!response.ok) {
    return { ok: false, reason: "request_failed" };
  }

  const body = (await response.json()) as FireworksResponse;
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    return { ok: false, reason: "invalid_json" };
  }

  try {
    const parsed = JSON.parse(jsonOnly(content)) as unknown;
    const draft = fireworksDraftSchema.safeParse(parsed);

    if (!draft.success) {
      return { ok: false, reason: "invalid_schema" };
    }

    return { ok: true, draft: draft.data };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
