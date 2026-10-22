import Link from "next/link";
import { CompareReveal } from "@/components/CompareReveal";
import { Mavi, Wordmark } from "@/components/Jellyfish";
import { OceanGrid } from "@/components/OceanGrid";

// Each client journey deep-links through sign-in to where it continues.
const clientJourneys = [
  { label: "Report an issue with my site or app", next: "/app/conversations/new?intent=issue" },
  { label: "Request a change or update", next: "/app/conversations/new?intent=change" },
  { label: "Follow my project", next: "/app/projects" },
  { label: "Hire or upgrade a service", next: "/app/plan" },
];

const promises = [
  "A real person reviews every request",
  "No work or charge without your approval",
  "Secure payment, only after you approve",
];

const cta = "inline-flex items-center gap-2 rounded-full bg-sunshine px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95";

function ClientTitle() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-soft-gold uppercase">Welcome back</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">I&apos;m already a client</h2>
      <Link href="/sign-in" className={`${cta} mt-7`}>
        Sign in <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function ClientDetails() {
  return (
    <>
      <p className="text-sm font-semibold text-soft-gold">Go to your workspace</p>
      <ul className="mt-4 space-y-2">
        {clientJourneys.map((j) => (
          <li key={j.label}>
            <Link
              href={`/sign-in?next=${encodeURIComponent(j.next)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-cream/15 px-4 py-3 text-sm hover:border-sunshine hover:bg-cream/5"
            >
              {j.label}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function NewTitle() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-honey uppercase">No account needed</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">I&apos;m new here</h2>
      <Link href="/talk" className={`${cta} mt-7`}>
        Talk to Mavi <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function NewDetails() {
  return (
    <>
      <p className="text-sm font-semibold text-honey">Tell us what you want to build</p>
      <p className="mt-3 text-muted">
        A new website, an app, a system or a data project. Chat with Mavi in your own words. No account
        needed, and a person on our team reviews every request before any price is shared.
      </p>
      <p className="mt-5 text-sm">
        <span className="font-semibold">Mavi</span> <span className="text-muted">· Your ally at every step.</span>
      </p>
    </>
  );
}

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

        {/* Desktop: one card, two paths. Dragging reveals what each path includes. */}
        <CompareReveal
          className="mt-12 hidden w-full overflow-hidden rounded-[2rem] border border-line text-left shadow-[0_24px_60px_-30px_rgba(37,35,31,0.35)] md:grid"
          label="Compare the two ways to start"
          defaultPosition={50}
          min={6}
          max={94}
          introSweep
          snapOnDoubleClick={50}
          before={
            <div className="grid h-full min-h-[21rem] grid-cols-2 bg-ink text-cream">
              <div data-reveal="50" className="flex flex-col items-start justify-center py-10 pr-14 pl-10">
                <ClientTitle />
              </div>
              <div data-reveal="94" className="flex flex-col justify-center py-10 pr-24 pl-14">
                <ClientDetails />
              </div>
            </div>
          }
          after={
            <div className="grid h-full min-h-[21rem] grid-cols-2 bg-surface">
              <div data-reveal="6" className="flex flex-col justify-center py-10 pr-14 pl-24">
                <NewDetails />
              </div>
              <div data-reveal="50" className="flex flex-col items-end justify-center py-10 pr-10 pl-14 text-right">
                <NewTitle />
              </div>
            </div>
          }
        />

        {/* Mobile: the same content stacked, nothing hidden. */}
        <div className="mt-10 grid w-full gap-4 text-left md:hidden">
          <section className="rounded-3xl bg-ink p-6 text-cream">
            <ClientTitle />
            <div className="mt-6">
              <ClientDetails />
            </div>
          </section>
          <section className="rounded-3xl border border-line bg-surface p-6">
            <NewTitle />
            <div className="mt-6">
              <NewDetails />
            </div>
          </section>
        </div>

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
