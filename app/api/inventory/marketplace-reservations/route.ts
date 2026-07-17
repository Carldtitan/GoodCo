import { NextResponse } from "next/server";
import { z } from "zod";
import { UNITS } from "@/contracts/goodco-pantry-mesh.constants";
import { getPantryContext } from "@/lib/pantry/context";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const reservationSchema = z.object({
  listingId: z.string().uuid(),
  requestId: z.string().uuid(),
  lotId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
});

export async function POST(request: Request) {
  const parsed = reservationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
  }

  const pantryContext = await getPantryContext();

  if (!pantryContext.userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { listingId, requestId, lotId, quantity, unit } = parsed.data;
  const { error } = await supabase.rpc("reserve_marketplace_quantity", {
    p_listing_id: listingId,
    p_request_id: requestId,
    p_lot_id: lotId,
    p_quantity: quantity,
    p_unit: unit,
    p_actor_id: pantryContext.userId,
  });

  if (error) {
    return NextResponse.json({ error: "Reservation failed" }, { status: 409 });
  }

  return NextResponse.json({ result: { reserved: true } });
}
