import Link from "next/link";
import { Mavi, Wordmark } from "@/components/Jellyfish";
import { OceanGrid } from "@/components/OceanGrid";
import { HomePaths } from "./HomePaths";

const promises = [
  "A real person reviews every request",
  "No work or charge without your approval",
  "Secure payment, only after you approve",
];

export default function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <OceanGrid />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
        <Wordmark descriptor />
        <Link
          href="/sign-in"
          className="rounded-full border border-ink/15 bg-surface/70 px-4 py-2 text-sm font-semibold backdrop-blur hover:border-ink"
        >
          Sign in
        </Link>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pt-6 pb-16 text-center sm:px-8">
        <Mavi size={96} float />
        <h1 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-6xl">
          Just ask.
          <br />
          <span className="bg-[linear-gradient(transparent_62%,var(--soft-gold)_62%)] px-1">
            We&apos;ll take care of the rest.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          One place for everything your digital projects need. Where would you like to start?
        </p>

        <HomePaths />

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          {promises.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-success" aria-hidden="true">
                <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
