import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

const emailOtpTypes = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createCookieSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", url.origin));
  }

  if (tokenHash && type && emailOtpTypes.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) return NextResponse.redirect(new URL("/", url.origin));
  }

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL("/auth/session", url.origin));
  }

  return NextResponse.redirect(new URL("/sign-in?error=link", url.origin));
}
