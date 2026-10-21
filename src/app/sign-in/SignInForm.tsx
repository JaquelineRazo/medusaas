"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Only internal portal paths, so `next` can't become an open redirect.
function safeNext(next: string | null) {
  return next && /^\/app(\/|\?|$)/.test(next) ? next : "/app";
}

export function SignInForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(next);
      }}
    >
      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          className="mt-1 h-11 w-full rounded-xl bg-cream px-3 outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 h-11 w-full rounded-xl bg-cream px-3 outline-none"
        />
      </label>
      <button
        type="submit"
        className="h-11 w-full rounded-full bg-sunshine font-semibold text-ink hover:brightness-95"
      >
        Sign in
      </button>
    </form>
  );
}
