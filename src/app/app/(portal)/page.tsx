import Link from "next/link";
import { Mavi } from "@/components/Jellyfish";
import { StatusBadge } from "@/components/StatusBadge";
import { requireClient } from "@/lib/auth";
import { fmtDate, fmtDateTime, tzLabel } from "@/lib/format";
import { kindLabel, supportStatus } from "@/lib/projects";
import { ticketCode } from "@/lib/ticket-machine";

export default async function ClientHome() {
  const { supabase, profile, orgs } = await requireClient();
  const tz = orgs[0]?.timezone;
  const [{ data: projects }, { data: tickets }, { data: calls }] = await Promise.all([
    supabase.from("projects").select("id, name, kind, url, stack, support_ends_on").neq("status", "archived").order("created_at"),
    supabase.from("tickets").select("id, number, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("calendar_events").select("title, starts_at, location").eq("type", "call").gte("starts_at", new Date().toISOString()).order("starts_at").limit(1),
  ]);
  const firstName = profile?.full_name?.split(" ")[0];
  const support = (projects ?? [])
    .map((p) => ({ p, s: supportStatus(p.support_ends_on, tz) }))
    .sort((a, b) => Number(b.s.active) - Number(a.s.active) || (a.s.days ?? 9e9) - (b.s.days ?? 9e9))[0];
  const nextCall = calls?.[0];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Hi{firstName ? ", " : ""}
        {firstName && <span className="font-accent text-[1.15em] font-normal tracking-normal italic">{firstName}</span>}
      </h1>
      <p className="mt-1 text-muted">Everything in one place. Tell us what you need and we&apos;ll take care of it.</p>

      <section className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr_0.8fr]">
        <div className="deep-flat flex flex-col gap-4 rounded-3xl p-6 text-cream">
          <div className="flex items-center gap-3">
            <Mavi size={44} />
            <h2 className="text-lg font-semibold">Send a request</h2>
          </div>
          <p className="text-sm text-cream/80">Report an issue, ask for a change or tell us about something new.</p>
          <Link href="/app/conversations/new" className="self-start rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink">
            Start a conversation →
          </Link>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">Support</p>
          {support ? (
            <>
              <p className="text-lg font-semibold">{support.p.name}</p>
              <p className="mt-1 text-sm text-muted">{support.s.label}</p>
              {support.s.active && support.s.days !== null && (
                <p className="mt-4 text-sm font-medium">
                  {support.s.days} day{support.s.days === 1 ? "" : "s"} left
                </p>
              )}
              <Link href="/app/plan" className="mt-3 inline-block text-sm font-medium text-honey">
                {support.s.active ? "What's included →" : "Keep your project covered →"}
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">No projects yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">Active projects</p>
          <p className="mt-2 text-4xl font-bold">{projects?.length ?? 0}</p>
          <Link href="/app/projects" className="mt-3 inline-block text-sm font-medium text-honey">
            View projects →
          </Link>
        </div>
      </section>

      {nextCall && (
        <Link href="/app/calendar" className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-3xl border border-line bg-surface px-6 py-4 hover:border-ink">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-sunshine" />
          <span className="text-sm text-muted">Next call</span>
          <span className="font-semibold">{nextCall.title}</span>
          <span className="text-sm text-muted">
            {fmtDate(nextCall.starts_at, tz, { weekday: "long", month: "short", day: "numeric" })} ·{" "}
            {new Date(nextCall.starts_at).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" })}{" "}
            {tzLabel(tz ?? "")}
            {nextCall.location ? ` · ${nextCall.location}` : ""}
          </span>
          <span className="ml-auto text-sm font-medium text-honey">See calendar →</span>
        </Link>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">My projects</h2>
          <Link href="/app/projects" className="text-sm font-medium text-honey">View all →</Link>
        </div>
        <ul className="flex flex-col gap-3">
          {(projects ?? []).map((p) => (
            <li key={p.id}>
              <Link href={`/app/projects/${p.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface p-4 hover:border-ink">
                <span className="min-w-40">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="text-sm text-muted">{p.url ?? kindLabel[p.kind]}</span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{kindLabel[p.kind]}</span>
                  {p.stack && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{p.stack}</span>}
                </span>
                <span className="ml-auto text-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent requests</h2>
          <Link href="/app/requests" className="text-sm font-medium text-honey">View all →</Link>
        </div>
        {tickets?.length ? (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/app/requests/${t.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm hover:bg-cream">
                  <span className="text-muted">{ticketCode(t.number)}</span>
                  <span className="min-w-0 flex-1 font-medium">{t.title}</span>
                  <span className="text-muted">{fmtDateTime(t.updated_at, tz)}</span>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            No requests yet. When you need something, just ask.
          </p>
        )}
      </section>
    </div>
  );
}
