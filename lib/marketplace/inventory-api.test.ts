import { describe, expect, it } from "vitest";
import { cancellationSchema, reservationSchema, toCancellationRpc, toReservationRpc } from "@/lib/marketplace/inventory-api";

const ids = {
  listingId: "00000000-0000-4000-8000-000000000001",
  requestId: "00000000-0000-4000-8000-000000000002",
  lotId: "00000000-0000-4000-8000-000000000003",
  actorId: "00000000-0000-4000-8000-000000000004",
};

describe("marketplace reservation input", () => {
  it("rejects zero or negative quantities", () => {
    expect(reservationSchema.safeParse({ ...ids, quantity: 0, unit: "case" }).success).toBe(false);
  });

  it("maps a validated reservation to the inventory RPC contract", () => {
    const input = reservationSchema.parse({ ...ids, quantity: "3", unit: "case" });
    expect(toReservationRpc(input, ids.actorId)).toMatchObject({ p_quantity: 3, p_unit: "case", p_actor_id: ids.actorId });
  });

  it("keeps an optional cancellation reason with the reversal", () => {
    const input = cancellationSchema.parse({ ...ids, quantity: 3, unit: "case", reason: "Pickup window changed" });
    expect(toCancellationRpc(input, ids.actorId).p_reason).toBe("Pickup window changed");
  });
});
