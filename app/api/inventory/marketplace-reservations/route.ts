import { NextResponse } from "next/server";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { reservationSchema, toReservationRpc } from "@/lib/marketplace/inventory-api";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const activePantry = await requireActivePantry();
    const parsed = reservationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Check the requested quantity and unit." }, { status: 400 });
    const { data, error } = await createServiceRoleSupabaseClient().rpc("reserve_marketplace_inventory", toReservationRpc(parsed.data, activePantry.userId));
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ movementId: data });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not reserve inventory." }, { status: 500 });
  }
}
