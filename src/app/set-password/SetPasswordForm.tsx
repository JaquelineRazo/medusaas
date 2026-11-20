"use client";

import { useActionState } from "react";
import { setPassword } from "@/app/auth/actions";
import { inputClass, submitClass } from "@/components/AuthCard";

// With a second factor set up, the code is asked here too (Supabase requires it to change the password).
export function SetPasswordForm({ needsCode }: { needsCode: boolean }) {
  const [state, action, pending] = useActionState(setPassword, undefined);
  return (
    <form className="mt-6 space-y-4" action={action}>
      <label className="block text-sm">
        <span className="font-medium">New password</span>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Repeat it</span>
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
      </label>
      {needsCode && (
        <label className="block text-sm">
          <span className="font-medium">6-digit code</span>
          <input name="code" inputMode="numeric" pattern="[0-9 ]{6,7}" required autoComplete="one-time-code" className={inputClass} />
          <span className="mt-1 block text-xs text-muted">Open your authenticator app and type the 6-digit code for meduSAAS.</span>
        </label>
      )}
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
