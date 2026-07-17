import { createCookieSupabaseClient } from "@/lib/supabase/ssr";
import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";

export type PantrySummary = {
  id: string;
  name: string;
  county: string;
  approvedStatus: "pending" | "approved" | "suspended";
  storageCapabilities: StorageType[];
};

export type PantryMembership = {
  role: "network_admin" | "admin" | "staff" | "volunteer";
  pantry: PantrySummary;
};

export type PantryContext = {
  userId: string | null;
  email: string | null;
  activePantry: PantrySummary | null;
  memberships: PantryMembership[];
};

type MembershipRow = {
  role: PantryMembership["role"];
  pantries: {
    id: string;
    name: string;
    county: string;
    approved_status: PantrySummary["approvedStatus"];
    storage_capabilities: StorageType[] | null;
  } | null;
};

export async function getPantryContext(): Promise<PantryContext> {
  const supabase = await createCookieSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      activePantry: null,
      memberships: [],
    };
  }

  const { data } = await supabase
    .from("pantry_memberships")
    .select(
      "role, pantries(id, name, county, approved_status, storage_capabilities)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .returns<MembershipRow[]>();

  const memberships =
    data
      ?.filter((row) => row.pantries)
      .map((row) => ({
        role: row.role,
        pantry: {
          id: row.pantries!.id,
          name: row.pantries!.name,
          county: row.pantries!.county,
          approvedStatus: row.pantries!.approved_status,
          storageCapabilities: row.pantries!.storage_capabilities ?? [],
        },
      })) ?? [];

  return {
    userId: user.id,
    email: user.email ?? null,
    activePantry: memberships[0]?.pantry ?? null,
    memberships,
  };
}
