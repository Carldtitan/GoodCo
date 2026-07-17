import { NextResponse } from "next/server";
import { z } from "zod";
import { MarketplaceAccessError, requireActivePantry, requireNetworkAdmin } from "@/lib/marketplace/access";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const adminPantrySchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("status"), pantryId: z.string().uuid(), status: z.enum(["approved", "suspended"]) }),
  z.object({ operation: z.literal("role"), pantryId: z.string().uuid(), userId: z.string().uuid(), role: z.enum(["member", "manager", "network_admin"]) }),
]);

export async function POST(request: Request) {
  try {
    const activePantry = await requireActivePantry(); requireNetworkAdmin(activePantry);
    if (!activePantry.networkId) return NextResponse.json({ error: "Your pantry is not in a network." }, { status: 409 });
    const parsed = adminPantrySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Check the admin change." }, { status: 400 });
    const service = createServiceRoleSupabaseClient();
    const { data: pantry } = await service.from("pantries").select("network_id").eq("id", parsed.data.pantryId).maybeSingle();
    if (!pantry || pantry.network_id !== activePantry.networkId) return NextResponse.json({ error: "That pantry is outside your network." }, { status: 403 });
    const result = parsed.data.operation === "status"
      ? await service.from("pantries").update({ approved_status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", parsed.data.pantryId)
      : await service.from("pantry_memberships").upsert({ pantry_id: parsed.data.pantryId, user_id: parsed.data.userId, role: parsed.data.role }, { onConflict: "user_id,pantry_id" });
    if (result.error) return NextResponse.json({ error: "Could not save this admin change." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) { if (error instanceof MarketplaceAccessError) return NextResponse.json({ error: error.message }, { status: error.status }); return NextResponse.json({ error: "Could not save this admin change." }, { status: 500 }); }
}
