"use client";

import { createClient } from "@supabase/supabase-js";
import { readPublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const env = readPublicEnv();

  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
