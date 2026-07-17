"use client";

import { createBrowserClient } from "@supabase/ssr";
import { readPublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const env = readPublicEnv();

  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
