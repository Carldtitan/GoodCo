import { describe, expect, it } from "vitest";
import { toReservationRpc } from "@/lib/marketplace/inventory-api";

describe("marketplace request reservation boundary", () => {
  it("maps a request to the inventory reservation RPC without an inventory update payload", () => {
    expect(toReservationRpc({ listingId: "00000000-0000-4000-8000-000000000001", requestId: "00000000-0000-4000-8000-000000000002", lotId: "00000000-0000-4000-8000-000000000003", quantity: 2, unit: "case" }, "00000000-0000-4000-8000-000000000004")).toMatchObject({ p_listing_id: "00000000-0000-4000-8000-000000000001", p_lot_id: "00000000-0000-4000-8000-000000000003" });
  });
});
