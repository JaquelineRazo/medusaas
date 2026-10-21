import Link from "next/link";
import { Wordmark } from "@/components/Jellyfish";

// Prototype: Phase 2 sends the reset link through Supabase Auth + Resend.
export default function ResetPassword() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark descriptor size={36} />
        </Link>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email. If you have an account, we&apos;ll send you a link to set a new password.
        </p>
        <form className="mt-6 space-y-4" action="/sign-in/">
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-xl bg-cream px-3 outline-none"
            />
          </label>
          <button
            type="submit"
            className="h-11 w-full rounded-full bg-sunshine font-semibold text-ink hover:brightness-95"
          >
            Send reset link
          </button>
        </form>
        <Link href="/sign-in" className="mt-5 inline-block text-sm font-medium text-honey">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
