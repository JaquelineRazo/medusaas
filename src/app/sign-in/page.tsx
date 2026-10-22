import Link from "next/link";
import { Suspense } from "react";
import { DeepSea } from "@/components/DeepSea";
import { Mavi, Wordmark } from "@/components/Jellyfish";
import { SignInForm } from "./SignInForm";

const waiting = ["Your projects", "Your requests", "Your team"];

// Prototype: no auth yet. Phase 2 uses Supabase Auth and redirects by role
// (staff → /console with mandatory MFA, clients → /app): MED-006.
export default function SignIn() {
  return (
    <div className="relative min-h-screen overflow-hidden text-cream">
      <DeepSea />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
        <Link href="/">
          <Wordmark descriptor size={34} />
        </Link>
        <Link href="/talk" className="text-sm font-semibold text-cream/80 hover:text-soft-gold">
          New here? Talk to Mavi
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-6 pb-24 sm:px-8 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-32">
        {/* Text sits low and to the left, the card floats higher on the right. */}
        <section className="lg:translate-y-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-soft-gold uppercase backdrop-blur">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sunshine shadow-[0_0_10px_2px_rgba(247,201,72,0.8)]" />
            Welcome back
          </p>
          <h1 className="mt-6 text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Good to see you
            <br />
            back in the <span className="glow-text text-soft-gold">bloom.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream/75">
            A group of jellyfish is called a bloom, and you&apos;re part of ours. Everything you
            build with us is right where you left it.
          </p>
          <ul className="mt-8 hidden flex-wrap gap-2 sm:flex">
            {waiting.map((w) => (
              <li key={w} className="rounded-full border border-cream/15 bg-cream/5 px-4 py-2 text-sm text-cream/85 backdrop-blur">
                {w} <span className="text-soft-gold">is waiting</span>
              </li>
            ))}
          </ul>
        </section>

        {/* The card is a jellyfish: a translucent bell with tentacles drifting below. */}
        <section className="relative mx-auto w-full max-w-md lg:-translate-y-6">
          <div
            className="relative z-10 bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(255,243,210,0.94))] px-8 pt-24 pb-8 text-ink shadow-[0_0_0_1px_rgba(255,232,154,0.55),0_0_90px_-12px_rgba(247,201,72,0.5),inset_0_-24px_48px_rgba(247,201,72,0.14)] sm:px-10"
            style={{ borderRadius: "50% 50% 2.25rem 2.25rem / 8rem 8rem 2.25rem 2.25rem" }}
          >
            <span
              aria-hidden="true"
              className="absolute top-5 left-[18%] h-6 w-24 -rotate-12 rounded-full bg-white/70 blur-[2px]"
            />
            <Mavi size={64} float className="mavi-glow absolute top-8 left-1/2 -ml-8" />
            <h2 className="text-center text-2xl font-bold">Sign in to your workspace</h2>
            <Suspense>
              <SignInForm />
            </Suspense>
            <div className="mt-5 flex justify-between text-sm">
              <Link href="/reset-password" className="font-medium text-honey">
                Forgot password?
              </Link>
              <Link href="/talk" className="text-muted hover:text-ink">
                Not a client yet?
              </Link>
            </div>
            <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
              Accounts are created by our team. If you work with us, check your email for your
              invitation.
            </p>
          </div>
          <svg
            viewBox="0 0 300 140"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="bell-tentacles absolute top-[calc(100%-1rem)] left-[10%] h-36 w-4/5"
          >
            <defs>
              <linearGradient id="bt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFE89A" stopOpacity="0.75" />
                <stop offset="1" stopColor="#FFE89A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 70, 120, 170, 220, 270].map((x, i) => (
              <path
                key={x}
                d={`M${x} 0c${i % 2 ? 14 : -14} 30 ${i % 2 ? -16 : 16} 60 ${i % 2 ? 4 : -4} ${100 + (i % 3) * 14}`}
                stroke="url(#bt)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg>
        </section>
      </main>
    </div>
  );
}
