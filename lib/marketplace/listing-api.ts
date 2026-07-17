import { z } from "zod";

export const listingCreateSchema = z
  .object({
    lotId: z.string().uuid(),
    quantity: z.coerce.number().positive(),
    pickupWindowStart: z.string().datetime(),
    pickupWindowEnd: z.string().datetime(),
    approvalMode: z.enum(["auto_approve", "source_pantry_approval", "network_admin_approval"]),
  })
  .refine((input) => new Date(input.pickupWindowEnd) > new Date(input.pickupWindowStart), {
    message: "Pickup end must be after pickup start.",
    path: ["pickupWindowEnd"],
  });

export type MarketplaceListingCreateInput = z.infer<typeof listingCreateSchema>;
