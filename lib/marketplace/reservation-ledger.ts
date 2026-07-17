export interface ReservationLedger {
  quantityOnHand: number;
  quantityReserved: number;
  listingAvailable: number;
}

function assertQuantity(state: ReservationLedger, quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (quantity > state.listingAvailable || quantity > state.quantityOnHand - state.quantityReserved) {
    throw new Error("Requested quantity is no longer available");
  }
}

export function reserveQuantity(state: ReservationLedger, quantity: number): ReservationLedger {
  assertQuantity(state, quantity);

  return {
    ...state,
    quantityReserved: state.quantityReserved + quantity,
    listingAvailable: state.listingAvailable - quantity,
  };
}

export function cancelReservation(state: ReservationLedger, quantity: number): ReservationLedger {
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > state.quantityReserved) {
    throw new Error("Reserved quantity is not available to release");
  }

  return {
    ...state,
    quantityReserved: state.quantityReserved - quantity,
    listingAvailable: state.listingAvailable + quantity,
  };
}

export function finalizeTransfer(state: ReservationLedger, quantity: number): ReservationLedger {
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > state.quantityReserved) {
    throw new Error("Reserved quantity is not available to transfer");
  }

  return {
    ...state,
    quantityOnHand: state.quantityOnHand - quantity,
    quantityReserved: state.quantityReserved - quantity,
  };
}
