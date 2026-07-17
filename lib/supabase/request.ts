import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readPublicEnv } from "@/lib/env";

export async function createRequestSupabaseClient() {
  const cookieStore = await cookies();
  const env = readPublicEnv();

  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieValues) {
        try {
          cookieValues.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Route handlers and actions can.
        }
      },
    },
  });
}
