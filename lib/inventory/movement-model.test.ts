import { describe, expect, it } from "vitest";
import {
  cancelReservedQuantity,
  finalizeTransferQuantity,
  reserveQuantity,
  type InventoryQuantityState,
} from "@/lib/inventory/movement-model";

const lot: InventoryQuantityState = {
  lotId: "source",
  pantryId: "source-pantry",
  productId: "product",
  quantityOnHand: 10,
  quantityReserved: 0,
  unit: "case",
};

describe("marketplace movement semantics", () => {
  it("reservation does not remove on-hand quantity", () => {
    const reserved = reserveQuantity(lot, 4);

    expect(reserved.quantityOnHand).toBe(10);
    expect(reserved.quantityReserved).toBe(4);
  });

  it("cancellation releases reserved quantity", () => {
    const reserved = reserveQuantity(lot, 4);
    const cancelled = cancelReservedQuantity(reserved, 3);

    expect(cancelled.quantityOnHand).toBe(10);
    expect(cancelled.quantityReserved).toBe(1);
  });

  it("final transfer decrements source and creates destination inventory", () => {
    const reserved = reserveQuantity(lot, 4);
    const result = finalizeTransferQuantity(reserved, "destination-pantry", 4);

    expect(result.source.quantityOnHand).toBe(6);
    expect(result.source.quantityReserved).toBe(0);
    expect(result.destination.pantryId).toBe("destination-pantry");
    expect(result.destination.quantityOnHand).toBe(4);
  });
});
