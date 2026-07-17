import "server-only";

import type { StorageType } from "@/contracts/goodco-pantry-mesh.types";
import { getPantryContext } from "@/lib/pantry/context";

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
  const context = await getPantryContext();
  if (!context.userId) {
    throw new MarketplaceAccessError("Sign in to use the marketplace.", 401);
  }
  const membership = context.memberships[0];
  if (!membership || !context.activePantry) {
    throw new MarketplaceAccessError("Your account is not assigned to a pantry.");
  }
  const pantry = context.activePantry;
  if (pantry.approvedStatus !== "approved") {
    throw new MarketplaceAccessError(
      "Your pantry needs approval before it can use the marketplace.",
    );
  }

  return {
    userId: context.userId,
    pantryId: pantry.id,
    networkId: pantry.networkId,
    role: membership.role as MarketplaceRole,
    approvedStatus: pantry.approvedStatus,
    storageCapabilities: pantry.storageCapabilities,
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
