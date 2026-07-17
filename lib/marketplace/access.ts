import "server-only";

import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export type MarketplaceRole = "member" | "manager" | "network_admin";

export type ActivePantry = {
  userId: string;
  pantryId: string;
  networkId: string | null;
  role: MarketplaceRole;
  approvedStatus: "pending" | "approved" | "suspended";
  storageCapabilities: StorageType[];
};

export class MarketplaceAccessError extends Error {
  constructor(
    message: string,
    public readonly status = 403,
  ) {
    super(message);
  }
}

export async function requireActivePantry(): Promise<ActivePantry> {
  const supabase = await createRequestSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new MarketplaceAccessError("Sign in to use the marketplace.", 401);
  }

  const { data, error } = await supabase
    .from("pantry_memberships")
    .select("role, pantries!inner(id, network_id, approved_status, storage_capabilities)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new MarketplaceAccessError("Your account is not assigned to a pantry.");
  }

  const membership = data as unknown as {
    role: MarketplaceRole;
    pantries: Array<{
      id: string;
      network_id: string | null;
      approved_status: "pending" | "approved" | "suspended";
      storage_capabilities: StorageType[];
    }>;
  };

  const pantry = membership.pantries[0];

  if (!pantry) {
    throw new MarketplaceAccessError("Your account is not assigned to a pantry.");
  }

  if (pantry.approved_status !== "approved") {
    throw new MarketplaceAccessError(
      "Your pantry needs approval before it can use the marketplace.",
    );
  }

  return {
    userId: user.id,
    pantryId: pantry.id,
    networkId: pantry.network_id,
    role: membership.role,
    approvedStatus: pantry.approved_status,
    storageCapabilities: pantry.storage_capabilities,
  };
}

export function requireMarketplaceManager(activePantry: ActivePantry) {
  if (activePantry.role === "member") {
    throw new MarketplaceAccessError("A pantry manager must complete this action.");
  }
}

export function requireNetworkAdmin(activePantry: ActivePantry) {
  if (activePantry.role !== "network_admin") {
    throw new MarketplaceAccessError("A network admin must complete this action.");
  }
}
