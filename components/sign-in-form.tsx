"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      return;
    }

    window.location.assign("/");
  }

  return (
    <form className="mt-5 grid max-w-sm gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input autoComplete="email" className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Password
        <input autoComplete="current-password" className="min-h-11 rounded-panel border border-border bg-surface px-3 text-sm" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" disabled={status === "loading"} type="submit">
        <LogIn aria-hidden="true" size={17} />
        {status === "loading" ? "Signing in" : "Sign in"}
      </button>
      {status === "error" ? <p aria-live="polite" className="text-sm font-medium text-danger">Email or password is wrong.</p> : null}
    </form>
  );
}
