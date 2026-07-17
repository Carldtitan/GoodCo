import { LogIn } from "lucide-react";
import { signInWithPassword } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "invalid_form"
      ? "Enter email and password."
      : params.error === "credentials"
        ? "Email or password is wrong."
        : null;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <form
        action={signInWithPassword}
        className="grid w-full max-w-sm gap-4 rounded-panel border border-border bg-surface p-5 shadow-panel"
      >
        <div>
          <h1 className="text-xl font-semibold">Sign in</h1>
          {errorMessage ? (
            <p className="mt-1 text-sm text-danger">{errorMessage}</p>
          ) : null}
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input
            autoComplete="email"
            className="h-11 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Password
          <input
            autoComplete="current-password"
            className="h-11 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            name="password"
            required
            type="password"
          />
        </label>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          type="submit"
        >
          <LogIn aria-hidden="true" size={17} />
          Sign in
        </button>
      </form>
    </main>
  );
}
