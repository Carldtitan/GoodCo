import { z } from "zod";

export const marketplaceRequestSchema = z.object({
  listingId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  requestedPickupTime: z.string().datetime().optional(),
});

export type MarketplaceRequestInput = z.infer<typeof marketplaceRequestSchema>;
