import { NextResponse } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));

  const supabase = await createCookieSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=email", requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
