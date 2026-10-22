"use client";

import { useActionState } from "react";
import { updateName } from "./actions";

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="block min-w-60 flex-1 text-sm">
        <span className="text-muted">Name</span>
        <input name="full_name" defaultValue={name} required maxLength={120} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-ink" />
      </label>
      <button type="submit" disabled={pending} className="h-11 rounded-full border border-line px-5 text-sm font-medium hover:bg-cream">
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.ok && <span role="status" className="text-sm text-success">Saved</span>}
      {state?.error && <span role="alert" className="text-sm text-danger">{state.error}</span>}
    </form>
  );
}
