import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel, Pill, Stat, money } from "@/components/ui";
import { assets, clients, tickets } from "@/lib/mock";

export function generateStaticParams() {
  return clients.map((c) => ({ id: c.id }));
}

const INTERNAL = 35; // placeholder internal value of an hour

export default async function Client360({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = clients.find((x) => x.id === id);
  if (!c) notFound();
  const history = tickets.filter((t) => t.clientId === c.id);
  const owned = assets.filter((a) => a.client === c.name);
  const supportCost = c.hoursThisMonth * INTERNAL;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/console/clients", label: "Clients" }}
        title={c.name}
        subtitle={`${c.contact} · ${c.email}`}
        action={
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium">
              Send invitation
            </button>
            <button type="button" className="rounded-full bg-sunshine px-4 py-2 text-sm font-semibold text-ink">
              New ticket
            </button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Lifetime revenue" value={money(c.lifetime)} />
        <Stat label="Balance" value={money(c.balance)} />
        <Stat label="Support hours (month)" value={`${c.hoursThisMonth}h`} hint={`≈ ${money(supportCost)} of your time`} />
        <Stat label="Plan" value={c.plan} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Projects">
          <ul className="divide-y divide-line">
            {c.projects.map((p) => (
              <li key={p.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="flex gap-2">
                  <Pill>{p.status}</Pill>
                  <Pill tone="gold">{p.coverage}</Pill>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Assets & renewals">
          <ul className="space-y-2 text-sm">
            {owned.map((a) => (
              <li key={a.name} className="flex justify-between gap-3">
                <span className="font-medium">{a.name}</span>
                <span className="text-muted">{a.provider} · {a.tech}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-cream p-3 text-sm">Next: {c.nextRenewal}</p>
          <p className="mt-3 text-xs text-muted">Credentials live in your password manager; only references are stored here.</p>
        </Panel>
        <Panel title="Ticket history" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {history.map((t) => (
              <li key={t.id}>
                <Link href={`/console/tickets/${t.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-honey">
                  <span className="text-muted">{t.id}</span>
                  <span className="min-w-0 flex-1 font-medium">{t.title}</span>
                  <Pill>{t.coverage}</Pill>
                  <span className="text-muted">{t.hoursLogged}h</span>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        {c.notes && (
          <Panel title="Notes" className="lg:col-span-2">
            <p className="text-sm">{c.notes}</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
