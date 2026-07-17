import { Chrome } from "lucide-react";
import { signInWithGoogle } from "./actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-background px-4"><form action={signInWithGoogle} className="grid w-full max-w-sm gap-4 rounded-panel border border-border bg-surface p-5 shadow-panel"><div><h1 className="text-xl font-semibold">Sign in</h1>{params.error ? <p className="mt-1 text-sm text-danger">Google sign-in failed.</p> : null}</div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" type="submit"><Chrome aria-hidden="true" size={17} />Continue with Google</button></form></main>;
}
