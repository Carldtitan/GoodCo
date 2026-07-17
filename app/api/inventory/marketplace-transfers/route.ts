import { NextResponse } from "next/server";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { toTransferRpc, transferSchema } from "@/lib/marketplace/inventory-api";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const activePantry = await requireActivePantry();
    const parsed = transferSchema.safeParse(await request.json());

    if (!parsed.success || parsed.data.destinationPantryId !== activePantry.pantryId) {
      return NextResponse.json({ error: "Only the receiving pantry can confirm this transfer." }, { status: 400 });
    }

    const { data, error } = await createServiceRoleSupabaseClient().rpc(
      "finalize_marketplace_transfer",
      toTransferRpc(parsed.data, activePantry.userId),
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ destinationLotId: data });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not finalize this transfer." }, { status: 500 });
  }
}
