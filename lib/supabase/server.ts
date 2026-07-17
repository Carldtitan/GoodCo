import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readPublicEnv, readServerEnv } from "@/lib/env";

export function createServerSupabaseClient() {
  const env = readPublicEnv();

  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServiceRoleSupabaseClient() {
  const env = readServerEnv();

  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
