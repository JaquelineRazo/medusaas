import Link from "next/link";
import { PageHeader, Panel, Pill, Stat } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { eventTypeLabel } from "@/lib/calendar";
import { daysUntil, fmtDate, fmtDay, todayIn } from "@/lib/format";
import { clientLabel, ticketCode, type TicketStatus } from "@/lib/ticket-machine";

type Attention = { tone: "danger" | "warning" | "gold"; text: string; href: string; cta: string };
const flow: TicketStatus[] = ["new", "evaluating", "quote_ready", "awaiting_payment", "in_progress", "client_review"];

// Exceptions first, numbers second.
export default async function MissionControl() {
  const { supabase } = await requireStaff();
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const in30 = new Date(now.getTime() + 30 * 86_400_000).toLocaleDateString("en-CA");
  const [{ data: tickets }, { data: ending }, { data: week }, { count: clients }] = await Promise.all([
    supabase.from("tickets").select("id, number, title, status, priority, organizations(name)").not("status", "in", "(completed,cancelled)"),
    supabase.from("projects").select("id, name, support_ends_on, organization_id, organizations(name)").gte("support_ends_on", todayIn()).lte("support_ends_on", in30).order("support_ends_on"),
    supabase.from("calendar_events").select("id, title, type, starts_at, all_day, organizations(name)").gte("starts_at", now.toISOString()).lte("starts_at", inAWeek).order("starts_at"),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
  ]);
  const open = tickets ?? [];

  const items: Attention[] = [];
  for (const t of open.filter((x) => x.priority === "urgent" || x.priority === "high"))
    items.push({ tone: t.priority === "urgent" ? "danger" : "warning", text: `${t.priority === "urgent" ? "Urgent" : "High"}: ${t.title} · ${t.organizations?.name}`, href: `/console/tickets/${t.id}`, cta: "Open" });
  const toAssess = open.filter((x) => x.status === "new" || x.status === "evaluating");
  if (toAssess.length) items.push({ tone: "warning", text: `${toAssess.length} request(s) waiting for assessment`, href: "/console/tickets", cta: "Assess" });
  for (const p of ending ?? []) {
    const d = daysUntil(p.support_ends_on!);
    items.push({ tone: "gold", text: `${p.organizations?.name} · ${p.name}: included support ends ${fmtDay(p.support_ends_on!)} (${d} day${d === 1 ? "" : "s"}). Offer a plan.`, href: `/console/clients/${p.organization_id}`, cta: "Open" });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mission Control" subtitle="What needs your attention today." />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="deep-flat rounded-3xl p-6 text-cream">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Needs attention</h2>
            <span className="rounded-full bg-sunshine px-3 py-0.5 text-sm font-bold text-ink">{items.length}</span>
          </div>
          {items.length ? (
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.text}>
                  <Link href={i.href} className="flex items-center gap-3 rounded-2xl border border-cream/10 px-4 py-3 text-sm hover:border-sunshine">
                    <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${i.tone === "danger" ? "bg-[#F97066]" : i.tone === "warning" ? "bg-sunshine" : "bg-soft-gold"}`} />
                    <span className="flex-1">{i.text}</span>
                    <span className="text-xs font-semibold text-soft-gold">{i.cta} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cream/70">All clear. Nothing needs you right now.</p>
          )}
        </section>
        <div className="grid grid-cols-2 content-start gap-4">
          <Stat label="Open requests" value={String(open.length)} />
          <Stat label="To assess" value={String(toAssess.length)} />
          <Stat label="Clients" value={String(clients ?? 0)} />
          <Stat label="Next 7 days" value={String(week?.length ?? 0)} hint="calls and key dates" />
        </div>
      </div>

      <Panel title="Next 7 days" className="mt-4" action={<Link href="/console/calendar" className="text-sm font-medium text-honey">Calendar →</Link>}>
        {week?.length ? (
          <ul className="divide-y divide-line">
            {week.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <span className="w-24 shrink-0 font-medium">{fmtDate(e.starts_at, undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                <span className="w-16 shrink-0 text-muted">{e.all_day ? "—" : new Date(e.starts_at).toLocaleTimeString("en-US", { timeZone: "America/Mexico_City", hour: "numeric", minute: "2-digit" })}</span>
                <span className="min-w-0 flex-1">{e.title} · <span className="text-muted">{e.organizations?.name}</span></span>
                <Pill tone={e.type === "call" ? "gold" : "neutral"}>{eventTypeLabel[e.type]}</Pill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nothing scheduled this week.</p>
        )}
      </Panel>

      <Panel title="Request flow" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {flow.map((s) => {
            const n = open.filter((t) => t.status === s);
            return (
              <div key={s} className="rounded-2xl bg-cream p-4">
                <p className="text-xs text-muted">{clientLabel[s]}</p>
                <p className="mt-1 text-2xl font-bold">{n.length}</p>
                <ul className="mt-2 space-y-1">
                  {n.map((t) => (
                    <li key={t.id}>
                      <Link href={`/console/tickets/${t.id}`} className="block truncate text-xs hover:text-honey">
                        {ticketCode(t.number)} · {t.organizations?.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
