"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });
    if (error) setStatus("error");
  }

  return (
    <form className="mt-5 grid max-w-sm gap-4" onSubmit={onSubmit}>
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={status === "loading"} type="submit">
        <Chrome aria-hidden="true" size={17} />
        {status === "loading" ? "Opening Google" : "Continue with Google"}
      </button>
      {status === "error" ? <p aria-live="polite" className="text-sm font-medium text-danger">Google sign-in failed.</p> : null}
    </form>
  );
}
