import Link from "next/link";
import { Mavi, Wordmark } from "@/components/Jellyfish";

// Each client journey deep-links through sign-in to where it continues.
const clientJourneys = [
  { label: "Report an issue with my site or app", next: "/app/conversations/new?intent=issue" },
  { label: "Request a change or update", next: "/app/conversations/new?intent=change" },
  { label: "Follow my project", next: "/app/projects" },
  { label: "Hire or upgrade a service", next: "/app/plan" },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
        <Wordmark descriptor />
        <Link href="/sign-in" className="text-sm font-semibold hover:text-honey">
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 pt-6 pb-16 text-center sm:px-8">
        <Mavi size={96} float />
        <h1 className="mt-6 text-4xl leading-tight font-bold sm:text-5xl">
          Just ask. We&apos;ll take care of the rest.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          One place for everything your digital projects need. Where would you like to start?
        </p>

        <div className="mt-10 grid w-full gap-5 text-left md:grid-cols-2">
          <section className="flex flex-col rounded-3xl bg-ink p-7 text-cream">
            <p className="text-xs font-semibold tracking-[0.18em] text-soft-gold uppercase">
              I&apos;m already a client
            </p>
            <h2 className="mt-3 text-2xl font-bold">Go to your workspace</h2>
            <ul className="mt-5 flex-1 space-y-2">
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
            <Link
              href="/sign-in"
              className="mt-6 self-start rounded-full bg-sunshine px-6 py-3 text-sm font-semibold text-ink hover:brightness-95"
            >
              Sign in →
            </Link>
          </section>

          <section className="flex flex-col rounded-3xl border border-line bg-surface p-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-honey uppercase">
              I&apos;m new here
            </p>
            <h2 className="mt-3 text-2xl font-bold">Tell us what you want to build</h2>
            <p className="mt-4 flex-1 text-muted">
              A new website, an app, a system or a data project. Chat with Mavi in your own words. No
              account needed, and a person on our team reviews every request before any price is
              shared.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream p-4">
              <Mavi size={40} />
              <p className="text-sm">
                <span className="block font-semibold">Mavi</span>
                <span className="text-muted">Your ally at every step.</span>
              </p>
            </div>
            <Link
              href="/talk"
              className="mt-6 self-start rounded-full bg-sunshine px-6 py-3 text-sm font-semibold text-ink hover:brightness-95"
            >
              Talk to Mavi →
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
