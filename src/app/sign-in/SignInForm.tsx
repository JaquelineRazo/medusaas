"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { inputClass, submitClass } from "@/components/AuthCard";

export function SignInForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signIn, undefined);
  // Controlled so a failed attempt doesn't wipe the email (React resets forms after an action).
  const [email, setEmail] = useState("");
  const expired = params.get("link") === "expired";
  return (
    <form className="mt-6 space-y-4" action={action}>
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      {expired && !state?.error && (
        <p role="status" className="rounded-xl bg-soft-gold px-3 py-2 text-sm">
          That link expired or was already used. Sign in, or reset your password to get a new one.
        </p>
      )}
      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
