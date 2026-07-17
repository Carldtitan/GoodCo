import { describe, expect, it } from "vitest";
import { canApproveRequest } from "@/lib/marketplace/approval";

describe("marketplace approvals", () => {
  it("routes restricted and admin-mode requests to a network admin", () => {
    expect(canApproveRequest({ role: "manager", activePantryId: "source", sourcePantryId: "source", approvalMode: "source_pantry_approval", requiresAdmin: true })).toBe(false);
    expect(canApproveRequest({ role: "network_admin", activePantryId: "source", sourcePantryId: "source", approvalMode: "network_admin_approval", requiresAdmin: true })).toBe(true);
  });

  it("lets a source manager approve an ordinary source-approval request", () => {
    expect(canApproveRequest({ role: "manager", activePantryId: "source", sourcePantryId: "source", approvalMode: "source_pantry_approval", requiresAdmin: false })).toBe(true);
  });
});
