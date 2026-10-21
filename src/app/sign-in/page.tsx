import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/Jellyfish";
import { SignInForm } from "./SignInForm";

// Prototype: no auth yet. Phase 2 uses Supabase Auth and redirects by role
// (staff → /console with mandatory MFA, clients → /app): MED-006.
export default function SignIn() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark descriptor size={36} />
        </Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to your workspace.</p>
        <Suspense>
          <SignInForm />
        </Suspense>
        <div className="mt-5 flex justify-between text-sm">
          <Link href="/reset-password" className="font-medium text-honey">
            Forgot password?
          </Link>
          <Link href="/talk" className="text-muted">
            Not a client yet?
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          Accounts are created by our team. If you work with us, check your email for your
          invitation.
        </p>
      </div>
    </div>
  );
}
