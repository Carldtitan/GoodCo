export function canApproveRequest(input: { role: string; activePantryId: string; sourcePantryId: string; approvalMode: string; requiresAdmin: boolean }) {
  if (input.requiresAdmin || input.approvalMode === "network_admin_approval") return input.role === "network_admin";
  return input.role === "manager" || input.role === "network_admin"
    ? input.activePantryId === input.sourcePantryId || input.role === "network_admin"
    : false;
}
