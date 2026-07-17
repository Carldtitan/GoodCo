"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

export async function signInWithGoogle() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createCookieSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect("/sign-in?error=google");
  }

  redirect(data.url);
}
