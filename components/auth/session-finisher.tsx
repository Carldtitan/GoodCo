"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SessionFinisher() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function finishSession() {
      const supabase = createBrowserSupabaseClient();
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError =
        hashParams.get("error_description") ?? hashParams.get("error");

      if (hashError) {
        router.replace("/sign-in?error=link");
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && !cancelled) {
          window.history.replaceState(null, "", window.location.pathname);
          router.replace("/");
          router.refresh();
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && !cancelled) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!cancelled) {
        router.replace("/sign-in?error=link");
      }
    }

    void finishSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="rounded-panel border border-border bg-surface px-5 py-4 text-sm font-medium shadow-panel">
        Signing in
      </div>
    </main>
  );
}
