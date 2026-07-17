import type {
  DateLabelType,
  DateReviewStatus,
  DateSource,
} from "@/contracts/goodco-pantry-mesh.types";

export type DateDraft = {
  rawText: string;
  transcript: string | null;
  normalizedDate: string | null;
  labelType: DateLabelType;
  source: DateSource;
  confidence: number;
  reviewStatus: DateReviewStatus;
};

const monthIndex: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function toIsoDate(year: number, month: number, day: number): string | null {
  if (year < 100) year += year >= 70 ? 1900 : 2000;
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function detectDateLabel(text: string): DateLabelType {
  const value = text.toLowerCase();

  if (value.includes("best by") || value.includes("best before")) {
    return "best_by";
  }
  if (value.includes("use by")) return "use_by";
  if (value.includes("sell by")) return "sell_by";
  if (value.includes("exp") || value.includes("expires")) return "expires";
  if (value.includes("packed") || value.includes("packaged")) return "packed_on";
  if (value.includes("produced") || value.includes("made on")) {
    return "produced_on";
  }

  return "unknown";
}

export function extractNormalizedDate(text: string): string | null {
  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    return toIsoDate(
      Number(numeric[3]),
      Number(numeric[1]),
      Number(numeric[2]),
    );
  }

  const named = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2}),?\s+(\d{2,4})\b/i,
  );

  if (named) {
    const month = monthIndex[named[1].toLowerCase()];
    if (month === undefined) return null;
    return toIsoDate(Number(named[3]), month + 1, Number(named[2]));
  }

  return null;
}

export function parseDateDraft(
  rawText: string,
  source: DateSource,
  transcript: string | null = null,
): DateDraft {
  const normalizedDate = extractNormalizedDate(rawText);

  return {
    rawText,
    transcript,
    normalizedDate,
    labelType: detectDateLabel(rawText),
    source,
    confidence: normalizedDate ? 0.78 : 0.25,
    reviewStatus: normalizedDate ? "draft_high_confidence" : "needs_review",
  };
}
