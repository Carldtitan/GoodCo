"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signInWithPassword(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/sign-in?error=invalid_form");
  }

  const supabase = await createCookieSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect("/sign-in?error=credentials");
  }

  redirect("/");
}
