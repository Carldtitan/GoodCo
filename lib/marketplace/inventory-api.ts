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

export const cancellationSchema = reservationSchema.extend({
  reason: z.string().trim().max(500).optional(),
});

export type MarketplaceCancellationInput = z.infer<typeof cancellationSchema>;

export const transferSchema = z.object({
  listingId: z.string().uuid(),
  requestId: z.string().uuid(),
  sourceLotId: z.string().uuid(),
  sourcePantryId: z.string().uuid(),
  destinationPantryId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: unitSchema,
  temperatureAtPickup: z.coerce.number().finite().optional(),
  temperatureAtReceipt: z.coerce.number().finite().optional(),
  photoUrl: z.string().url().optional(),
});

export type MarketplaceTransferInput = z.infer<typeof transferSchema>;

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

export function toCancellationRpc(input: MarketplaceCancellationInput, actorId: string) {
  return {
    ...toReservationRpc(input, actorId),
    p_reason: input.reason ?? null,
  };
}

export function toTransferRpc(input: MarketplaceTransferInput, actorId: string) {
  return {
    p_listing_id: input.listingId,
    p_request_id: input.requestId,
    p_source_lot_id: input.sourceLotId,
    p_source_pantry_id: input.sourcePantryId,
    p_destination_pantry_id: input.destinationPantryId,
    p_quantity: input.quantity,
    p_unit: input.unit,
    p_actor_id: actorId,
    p_temperature_at_pickup: input.temperatureAtPickup ?? null,
    p_temperature_at_receipt: input.temperatureAtReceipt ?? null,
    p_photo_url: input.photoUrl ?? null,
  };
}
