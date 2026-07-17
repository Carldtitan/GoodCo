import { NextResponse } from "next/server";
import { z } from "zod";
import { UNITS } from "@/contracts/goodco-pantry-mesh.constants";
import { getPantryContext } from "@/lib/pantry/context";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const transferSchema = z.object({
  listingId: z.string().uuid(),
  requestId: z.string().uuid(),
  sourceLotId: z.string().uuid(),
  sourcePantryId: z.string().uuid(),
  destinationPantryId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
  temperatureAtPickup: z.number().optional(),
  temperatureAtReceipt: z.number().optional(),
  photoUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const parsed = transferSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transfer" }, { status: 400 });
  }

  const pantryContext = await getPantryContext();

  if (!pantryContext.userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const input = parsed.data;
  const { data, error } = await supabase.rpc("finalize_marketplace_transfer", {
    p_listing_id: input.listingId,
    p_request_id: input.requestId,
    p_source_lot_id: input.sourceLotId,
    p_source_pantry_id: input.sourcePantryId,
    p_destination_pantry_id: input.destinationPantryId,
    p_quantity: input.quantity,
    p_unit: input.unit,
    p_actor_id: pantryContext.userId,
    p_temperature_at_pickup: input.temperatureAtPickup ?? null,
    p_temperature_at_receipt: input.temperatureAtReceipt ?? null,
    p_photo_url: input.photoUrl ?? null,
  });

  if (error) {
    return NextResponse.json({ error: "Transfer failed" }, { status: 409 });
  }

  return NextResponse.json({
    result: {
      destinationLotId: data,
    },
  });
}
