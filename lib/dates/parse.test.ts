import { describe, expect, it } from "vitest";
import { parseDateDraft } from "@/lib/dates/parse";

describe("date draft parsing", () => {
  it("normalizes numeric dates as draft review values", () => {
    const draft = parseDateDraft("best by 03/12/2027", "ocr");

    expect(draft.normalizedDate).toBe("2027-03-12");
    expect(draft.labelType).toBe("best_by");
    expect(draft.reviewStatus).toBe("draft_high_confidence");
  });

  it("keeps voice transcript raw for review", () => {
    const draft = parseDateDraft(
      "expires July 8 2026",
      "voice",
      "expires July 8 2026",
    );

    expect(draft.normalizedDate).toBe("2026-07-08");
    expect(draft.transcript).toBe("expires July 8 2026");
    expect(draft.source).toBe("voice");
  });
});
