import type { Unit } from "@/contracts/goodco-pantry-mesh.types";

export type InventoryQuantityState = {
  lotId: string;
  pantryId: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  unit: Unit;
};

function assertPositive(quantity: number) {
  if (quantity <= 0) {
    throw new Error("quantity_must_be_positive");
  }
}

export function reserveQuantity(
  lot: InventoryQuantityState,
  quantity: number,
): InventoryQuantityState {
  assertPositive(quantity);

  if (lot.quantityOnHand - lot.quantityReserved < quantity) {
    throw new Error("insufficient_quantity");
  }

  return {
    ...lot,
    quantityReserved: lot.quantityReserved + quantity,
  };
}

export function cancelReservedQuantity(
  lot: InventoryQuantityState,
  quantity: number,
): InventoryQuantityState {
  assertPositive(quantity);

  if (lot.quantityReserved < quantity) {
    throw new Error("reserved_quantity_too_low");
  }

  return {
    ...lot,
    quantityReserved: lot.quantityReserved - quantity,
  };
}

export function finalizeTransferQuantity(
  source: InventoryQuantityState,
  destinationPantryId: string,
  quantity: number,
): {
  source: InventoryQuantityState;
  destination: InventoryQuantityState;
} {
  assertPositive(quantity);

  if (source.quantityOnHand < quantity) {
    throw new Error("insufficient_on_hand_quantity");
  }

  if (source.quantityReserved < quantity) {
    throw new Error("insufficient_reserved_quantity");
  }

  return {
    source: {
      ...source,
      quantityOnHand: source.quantityOnHand - quantity,
      quantityReserved: source.quantityReserved - quantity,
    },
    destination: {
      lotId: "destination",
      pantryId: destinationPantryId,
      productId: source.productId,
      quantityOnHand: quantity,
      quantityReserved: 0,
      unit: source.unit,
    },
  };
}
