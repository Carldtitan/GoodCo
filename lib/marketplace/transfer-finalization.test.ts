import { describe, expect, it } from "vitest";
import { toTransferRpc, transferSchema } from "@/lib/marketplace/inventory-api";

describe("marketplace transfer finalization boundary", () => {
  it("sends source, destination, quantity, and cold-chain fields only through the transfer RPC", () => {
    const input = transferSchema.parse({ listingId: "00000000-0000-4000-8000-000000000001", requestId: "00000000-0000-4000-8000-000000000002", sourceLotId: "00000000-0000-4000-8000-000000000003", sourcePantryId: "00000000-0000-4000-8000-000000000004", destinationPantryId: "00000000-0000-4000-8000-000000000005", quantity: 2, unit: "case", temperatureAtReceipt: 4 });
    expect(toTransferRpc(input, "00000000-0000-4000-8000-000000000006")).toMatchObject({ p_source_lot_id: input.sourceLotId, p_destination_pantry_id: input.destinationPantryId, p_quantity: 2, p_temperature_at_receipt: 4 });
  });
});
