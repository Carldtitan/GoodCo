import "server-only";

import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

export const createRequestSupabaseClient = createCookieSupabaseClient;
