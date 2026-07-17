import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function ensureGoodCoAdminMembership(
  userId: string | null | undefined,
  email: string | null | undefined,
) {
  if (!userId || !email) return;

  const service = createServiceRoleSupabaseClient();
  await service.rpc("ensure_goodco_admin_membership", {
    target_user_id: userId,
    target_email: email,
  });
}
