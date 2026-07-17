import { describe, expect, it } from "vitest";
import { listingCreateSchema } from "@/lib/marketplace/listing-api";

const input = {
  lotId: "00000000-0000-4000-8000-000000000001",
  quantity: "3",
  pickupWindowStart: "2026-07-20T09:00:00.000Z",
  pickupWindowEnd: "2026-07-20T11:00:00.000Z",
  approvalMode: "source_pantry_approval",
};

describe("marketplace listing input", () => {
  it("accepts a dated, zero-price listing payload", () => {
    expect(listingCreateSchema.parse(input)).toMatchObject({ quantity: 3, approvalMode: "source_pantry_approval" });
  });

  it("rejects a pickup window that ends before it starts", () => {
    expect(listingCreateSchema.safeParse({ ...input, pickupWindowEnd: input.pickupWindowStart }).success).toBe(false);
  });
});
