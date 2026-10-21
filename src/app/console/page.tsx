import Link from "next/link";
import { PageHeader, Panel, Pill, Stat, money } from "@/components/ui";
import { assets, clients, leads, revenue, statusLabel, tickets, type TicketStatus } from "@/lib/mock";

type Attention = { tone: "danger" | "warning" | "gold"; text: string; href: string; cta: string };

// The point of Mission Control: exceptions first, numbers second.
function needsAttention(): Attention[] {
  const items: Attention[] = [];
  for (const a of assets.filter((x) => x.status === "Down"))
    items.push({ tone: "danger", text: `${a.name} is down (${a.client})`, href: "/console/assets", cta: "Check" });
  for (const t of tickets.filter((x) => x.priority === "Urgent" && x.status !== "completed"))
    items.push({ tone: "danger", text: `Urgent: ${t.title} · ${t.client}`, href: `/console/tickets/${t.id}`, cta: "Assess" });
  const unassessed = tickets.filter((x) => x.status === "evaluating" && x.priority !== "Urgent");
  if (unassessed.length)
    items.push({ tone: "warning", text: `${unassessed.length} ticket(s) waiting for assessment`, href: "/console/tickets", cta: "Open" });
  for (const t of tickets.filter((x) => x.status === "awaiting_payment"))
    items.push({ tone: "warning", text: `Waiting for payment: ${t.id} · ${money(t.amount ?? 0)} · ${t.client}`, href: "/console/revenue", cta: "Follow up" });
  const newLeads = leads.filter((l) => l.stage === "New");
  if (newLeads.length)
    items.push({ tone: "gold", text: `${newLeads.length} new lead(s) from Mavi`, href: "/console/inbox", cta: "Review" });
  for (const a of assets.filter((x) => x.status === "Degraded"))
    items.push({ tone: "gold", text: `${a.name} is degraded (${a.client})`, href: "/console/assets", cta: "Check" });
  items.push({ tone: "gold", text: "Tusitio · included support ends Nov 12; offer a plan", href: "/console/clients/tusitio", cta: "Open" });
  return items;
}

const flow: TicketStatus[] = ["evaluating", "quote_ready", "awaiting_payment", "in_progress", "client_review"];

export default function MissionControl() {
  const items = needsAttention();
  const open = tickets.filter((t) => t.status !== "completed");
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mission Control" subtitle="What needs your attention today." />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl bg-ink p-6 text-cream">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Needs attention</h2>
            <span className="rounded-full bg-sunshine px-3 py-0.5 text-sm font-bold text-ink">{items.length}</span>
          </div>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.text}>
                <Link
                  href={i.href}
                  className="flex items-center gap-3 rounded-2xl border border-cream/10 px-4 py-3 text-sm hover:border-sunshine"
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      i.tone === "danger" ? "bg-[#F97066]" : i.tone === "warning" ? "bg-sunshine" : "bg-soft-gold"
                    }`}
                  />
                  <span className="flex-1">{i.text}</span>
                  <span className="text-xs font-semibold text-soft-gold">{i.cta} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-2 content-start gap-4">
          <Stat label="Collected this month" value={money(revenue.collectedThisMonth)} />
          <Stat label="Outstanding" value={money(revenue.outstanding)} />
          <Stat label="Open tickets" value={String(open.length)} />
          <Stat label="Active clients" value={String(clients.length)} hint={`MRR ${money(revenue.mrr)}`} />
        </div>
      </div>

      <Panel title="Request-to-revenue flow" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-5">
          {flow.map((s) => {
            const n = tickets.filter((t) => t.status === s);
            return (
              <div key={s} className="rounded-2xl bg-cream p-4">
                <p className="text-xs text-muted">{statusLabel[s]}</p>
                <p className="mt-1 text-2xl font-bold">{n.length}</p>
                <ul className="mt-2 space-y-1">
                  {n.map((t) => (
                    <li key={t.id}>
                      <Link href={`/console/tickets/${t.id}`} className="block truncate text-xs hover:text-honey">
                        {t.id} · {t.client}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="New leads" className="mt-4" action={<Link href="/console/inbox" className="text-sm font-medium text-honey">Inbox →</Link>}>
        <ul className="divide-y divide-line">
          {leads.filter((l) => l.stage === "New").map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
              <span className="font-medium">{l.name}</span>
              <span className="min-w-0 flex-1 text-muted">{l.need}</span>
              <Pill tone="gold">{l.source}</Pill>
              <span className="text-xs text-muted">{l.received}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
