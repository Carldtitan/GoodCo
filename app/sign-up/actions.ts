"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function findAuthUserIdByEmail(email: string) {
  const service = createServiceRoleSupabaseClient();
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) return null;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail,
    );

    if (match) return match.id;
    if (data.users.length < 100) return null;
  }

  return null;
}

export async function signUpWithPassword(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/sign-up?error=invalid_form");
  }

  const service = createServiceRoleSupabaseClient();
  const { error: createError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError) {
    const existingUserId = await findAuthUserIdByEmail(parsed.data.email);

    if (!existingUserId) {
      redirect("/sign-up?error=create");
    }

    const { error: updateError } = await service.auth.admin.updateUserById(
      existingUserId,
      {
        password: parsed.data.password,
        email_confirm: true,
      },
    );

    if (updateError) {
      redirect("/sign-up?error=create");
    }
  }

  const supabase = await createCookieSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    redirect("/sign-in?error=credentials");
  }

  redirect("/");
}
