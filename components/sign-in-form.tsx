"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "sent" | "rate_limit" | "error"
  >("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        shouldCreateUser: true,
      },
    });
    setStatus(
      error?.status === 429 || error?.code === "over_email_send_rate_limit"
        ? "rate_limit"
        : error
          ? "error"
          : "sent",
    );
  }

  return (
    <form className="mt-5 grid max-w-sm gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input autoComplete="email" className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={status === "loading"} type="submit">
        <Mail aria-hidden="true" size={17} />
        {status === "loading" ? "Sending" : "Send link"}
      </button>
      {status === "sent" ? <p aria-live="polite" className="text-sm text-success">Check your email.</p> : null}
      {status === "rate_limit" ? <p aria-live="polite" className="text-sm font-medium text-danger">Too many links sent. Try again shortly.</p> : null}
      {status === "error" ? <p aria-live="polite" className="text-sm font-medium text-danger">Could not send the sign-in link.</p> : null}
    </form>
  );
}
