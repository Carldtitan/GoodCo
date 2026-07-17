"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

const signInSchema = z.object({
  email: z.string().email(),
});

export async function signInWithEmail(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/sign-in?error=email");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createCookieSupabaseClient();

  await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  redirect("/sign-in?sent=1");
}
