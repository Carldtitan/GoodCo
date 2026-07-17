import { NextResponse } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/sign-in?error=google", url.origin));
  }

  if (code) {
    const supabase = await createCookieSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/marketplace", url.origin));
  }

  return NextResponse.redirect(new URL("/sign-in", url.origin));
}
