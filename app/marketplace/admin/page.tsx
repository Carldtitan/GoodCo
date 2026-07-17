import { AdminPantryControls } from "@/components/admin-pantry-controls";
import { MarketplaceAccessError, requireActivePantry, requireNetworkAdmin } from "@/lib/marketplace/access";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export default async function MarketplaceAdminPage() {
  try {
    const activePantry = await requireActivePantry(); requireNetworkAdmin(activePantry);
    if (!activePantry.networkId) throw new Error("Your pantry is not in a network.");
    const service = createServiceRoleSupabaseClient();
    const [{ data, error }, { data: memberships, error: membershipsError }] = await Promise.all([service.from("pantries").select("id, name, approved_status").eq("network_id", activePantry.networkId).order("name"), service.from("pantry_memberships").select("user_id, pantry_id, role, pantries!inner(name, network_id)").eq("pantries.network_id", activePantry.networkId)]);
    if (error || membershipsError) throw new Error("Could not load admin controls.");
    return <section className="py-5"><h1 className="text-xl font-semibold tracking-tight">Admin</h1><AdminPantryControls memberships={(memberships ?? []).map((membership) => { const pantry = membership.pantries as unknown as { name: string }; return { userId: membership.user_id, pantryId: membership.pantry_id, pantryName: pantry.name, role: membership.role }; })} pantries={(data ?? []).map((pantry) => ({ id: pantry.id, name: pantry.name, approvedStatus: pantry.approved_status }))} /></section>;
  } catch (error) { const message = error instanceof MarketplaceAccessError ? error.message : error instanceof Error ? error.message : "Could not load admin controls."; return <section className="py-5"><h1 className="text-xl font-semibold tracking-tight">Admin</h1><p className="mt-6 border-y border-border py-8 text-center text-sm text-muted">{message}</p></section>; }
}
