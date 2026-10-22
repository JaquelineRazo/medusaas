"use client";

import { useActionState } from "react";
import { requestReset } from "@/app/auth/actions";
import { inputClass, submitClass } from "@/components/AuthCard";

export function ResetForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);
  // Same answer whether or not the email exists.
  if (state?.sent)
    return (
      <p role="status" className="mt-6 rounded-xl bg-soft-gold px-4 py-3 text-sm">
        If that email has an account, a reset link is on its way. It works once and expires in 1 hour.
      </p>
    );
  return (
    <form className="mt-6 space-y-4" action={action}>
      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
