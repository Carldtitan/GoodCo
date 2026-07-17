import { Mail } from "lucide-react";
import { signInWithEmail } from "./actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-background px-4"><form action={signInWithEmail} className="grid w-full max-w-sm gap-4 rounded-panel border border-border bg-surface p-5 shadow-panel"><div><h1 className="text-xl font-semibold">Sign in</h1>{params.sent ? <p className="mt-1 text-sm text-success">Check your email.</p> : null}{params.error ? <p className="mt-1 text-sm text-danger">Enter a valid email.</p> : null}</div><label className="grid gap-1 text-sm font-medium">Email<input autoComplete="email" className="h-11 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" name="email" required type="email" /></label><button className="inline-flex h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" type="submit"><Mail aria-hidden="true" size={17} />Send link</button></form></main>;
}
