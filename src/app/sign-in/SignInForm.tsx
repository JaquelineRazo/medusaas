"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Only internal portal paths, so `next` can't become an open redirect.
function safeNext(next: string | null) {
  return next && /^\/app(\/|\?|$)/.test(next) ? next : "/app";
}

export function SignInForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        // Prototype stand-in for the role check (MED-006): staff go to the Admin Workspace.
        router.push(/@razzobusiness\.com$/i.test(email.trim()) ? "/console" : next);
      }}
    >
      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-ink"
        />
      </label>
      <button
        type="submit"
        className="h-11 w-full rounded-full bg-sunshine font-semibold text-ink hover:brightness-95"
      >
        Sign in
      </button>
      <p className="text-xs text-muted italic">
        Prototype: any email works. Emails at razzobusiness.com open the Admin Workspace.
      </p>
    </form>
  );
}
