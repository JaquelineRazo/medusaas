"use client";

import { useActionState } from "react";
import { setPassword } from "@/app/auth/actions";
import { inputClass, submitClass } from "@/components/AuthCard";

export function SetPasswordForm() {
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
