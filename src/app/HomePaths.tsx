"use client";

import Link from "next/link";
import { CompareReveal } from "@/components/CompareReveal";

// Each client journey deep-links through sign-in to where it continues.
const clientJourneys = [
  { label: "Report an issue with my site or app", next: "/app/conversations/new?intent=issue" },
  { label: "Request a change or update", next: "/app/conversations/new?intent=change" },
  { label: "Follow my project", next: "/app/projects" },
  { label: "Hire or upgrade a service", next: "/app/plan" },
];

// Each one opens Mavi with that answer already given (same values as the /talk chips).
const newIdeas = [
  { label: "A new website", start: "A new website" },
  { label: "An app or system", start: "An app or system" },
  { label: "A data project", start: "A data project" },
  { label: "I'm just exploring", start: "Just exploring" },
];

const cta =
  "inline-flex items-center gap-2 rounded-full bg-sunshine px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95";
const box = "flex items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-sm transition";

// 0 → 1 as the handle moves from `from` towards `to`.
const progress = (pos: number, from: number, to: number) => Math.min(1, Math.max(0, (pos - from) / (to - from)));

function ClientTitle() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-soft-gold uppercase">Welcome back</p>
      <h2 className="mt-3 text-3xl leading-tight font-bold lg:text-4xl">I&apos;m already a client</h2>
      <Link href="/sign-in" className={`${cta} mt-7`}>
        Sign in <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function ClientBoxes() {
  return (
    <>
      <p className="text-sm font-semibold text-soft-gold">Go to your workspace</p>
      <ul className="mt-3 space-y-2">
        {clientJourneys.map((j) => (
          <li key={j.label}>
            <Link
              href={`/sign-in?next=${encodeURIComponent(j.next)}`}
              className={`${box} border-cream/15 hover:border-sunshine hover:bg-cream/5`}
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

function NewTitle({ align = "start" }: { align?: "start" | "end" }) {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-honey uppercase">No account needed</p>
      <h2 className="mt-3 text-3xl leading-tight font-bold lg:text-4xl">I&apos;m new here</h2>
      <Link href="/talk" className={`${cta} mt-7 ${align === "end" ? "self-end" : ""}`}>
        Talk to Mavi <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function NewBoxes() {
  return (
    <>
      <p className="text-sm font-semibold text-honey">What would you like to build?</p>
      <ul className="mt-3 space-y-2">
        {newIdeas.map((i) => (
          <li key={i.label}>
            <Link
              href={`/talk?start=${encodeURIComponent(i.start)}`}
              className={`${box} border-line bg-cream/40 hover:border-ink`}
            >
              {i.label}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">A person reviews every request before any price is shared.</p>
    </>
  );
}

export function HomePaths() {
  return (
    <>
      {/* Desktop: one card, two paths. Dragging opens each path's options next to the handle. */}
      <CompareReveal
        className="mt-12 hidden h-[24rem] w-full overflow-hidden rounded-[2rem] border border-line text-left shadow-[0_24px_60px_-30px_rgba(37,35,31,0.35)] lg:block"
        label="Compare the two ways to start"
        min={22}
        max={78}
        introSweep
        snapOnDoubleClick={50}
        before={(pos) => {
          const t = progress(pos, 55, 70);
          const fade = 1 - progress(pos, 42, 32); // the title steps back when the other side opens
          return (
            <div className="flex h-full items-center gap-10 bg-ink py-8 pr-16 pl-10 text-cream">
              <div data-reveal="50" className="flex w-60 shrink-0 flex-col items-start" style={{ opacity: fade }}>
                <ClientTitle />
              </div>
              <div
                data-reveal="78"
                className="min-w-0 flex-1"
                style={{ opacity: t, transform: `translateX(${(1 - t) * 24}px)`, pointerEvents: t > 0.5 ? "auto" : "none" }}
              >
                <ClientBoxes />
              </div>
            </div>
          );
        }}
        after={(pos) => {
          const t = progress(pos, 45, 30);
          const fade = 1 - progress(pos, 58, 68);
          return (
            <div className="flex h-full items-center justify-end gap-10 bg-surface py-8 pr-10 pl-16">
              <div
                data-reveal="22"
                className="min-w-0 flex-1"
                style={{ opacity: t, transform: `translateX(${(t - 1) * 24}px)`, pointerEvents: t > 0.5 ? "auto" : "none" }}
              >
                <NewBoxes />
              </div>
              <div data-reveal="50" className="flex w-60 shrink-0 flex-col items-end text-right" style={{ opacity: fade }}>
                <NewTitle align="end" />
              </div>
            </div>
          );
        }}
      />

      {/* Mobile and tablet: the same content stacked, nothing hidden. */}
      <div className="mt-10 grid w-full gap-4 text-left md:grid-cols-2 lg:hidden">
        <section className="flex flex-col items-start rounded-3xl bg-ink p-6 text-cream">
          <ClientTitle />
          <div className="mt-6 w-full">
            <ClientBoxes />
          </div>
        </section>
        <section className="flex flex-col items-start rounded-3xl border border-line bg-surface p-6">
          <NewTitle />
          <div className="mt-6 w-full">
            <NewBoxes />
          </div>
        </section>
      </div>
    </>
  );
}
