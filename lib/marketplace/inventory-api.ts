import { z } from "zod";
import type { Unit } from "@/contracts/goodco-pantry-mesh.types";

export const unitSchema = z.enum(["each", "case", "box", "lb", "oz", "gal"]);

export const reservationSchema = z.object({
  listingId: z.string().uuid(),
  requestId: z.string().uuid(),
  lotId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: unitSchema,
});

export type MarketplaceReservationInput = z.infer<typeof reservationSchema>;

export function toReservationRpc(input: MarketplaceReservationInput, actorId: string) {
  return {
    p_listing_id: input.listingId,
    p_request_id: input.requestId,
    p_lot_id: input.lotId,
    p_quantity: input.quantity,
    p_unit: input.unit as Unit,
    p_actor_id: actorId,
  };
}
