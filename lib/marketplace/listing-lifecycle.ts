import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function expireMarketplaceListings(now = new Date().toISOString()) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: "expired", updated_at: now })
    .eq("status", "active")
    .lt("pickup_window_end", now);

  if (error) throw new Error("Could not expire marketplace listings.");
}
