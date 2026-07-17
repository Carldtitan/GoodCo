import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <SignInForm />
    </main>
  );
}
