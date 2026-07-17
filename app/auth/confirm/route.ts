import { NextResponse } from "next/server";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createRequestSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/marketplace", url.origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "email" });
    if (!error) return NextResponse.redirect(new URL("/marketplace", url.origin));
  }

  return NextResponse.redirect(new URL("/sign-in", url.origin));
}
