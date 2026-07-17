import { describe, expect, it } from "vitest";
import { marketplaceRequestSchema } from "@/lib/marketplace/request-api";

describe("marketplace request input", () => {
  it("requires an active listing id and a positive quantity", () => {
    expect(marketplaceRequestSchema.safeParse({ listingId: "not-a-uuid", quantity: 2 }).success).toBe(false);
    expect(marketplaceRequestSchema.safeParse({ listingId: "00000000-0000-4000-8000-000000000001", quantity: 0 }).success).toBe(false);
  });
});
