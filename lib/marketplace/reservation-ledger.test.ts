import { describe, expect, it } from "vitest";
import { cancelReservation, finalizeTransfer, reserveQuantity } from "@/lib/marketplace/reservation-ledger";

const availableLot = { quantityOnHand: 12, quantityReserved: 0, listingAvailable: 12 };

describe("marketplace inventory reservation ledger", () => {
  it("keeps on-hand quantity intact when a request reserves inventory", () => {
    expect(reserveQuantity(availableLot, 4)).toEqual({ quantityOnHand: 12, quantityReserved: 4, listingAvailable: 8 });
  });

  it("releases both the reservation and listing availability on cancellation", () => {
    const reserved = reserveQuantity(availableLot, 4);
    expect(cancelReservation(reserved, 4)).toEqual(availableLot);
  });

  it("removes on-hand inventory only after transfer finalization", () => {
    const reserved = reserveQuantity(availableLot, 4);
    expect(finalizeTransfer(reserved, 4)).toEqual({ quantityOnHand: 8, quantityReserved: 0, listingAvailable: 8 });
  });

  it("does not allow oversubscribing the lot or transferring an unreserved quantity", () => {
    expect(() => reserveQuantity(availableLot, 13)).toThrow("no longer available");
    expect(() => finalizeTransfer(availableLot, 1)).toThrow("not available to transfer");
  });
});
