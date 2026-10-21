import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel, Pill } from "@/components/ui";
import { clientTickets, tickets } from "@/lib/mock";
import { Assessment } from "./Assessment";

export function generateStaticParams() {
  return tickets.map((t) => ({ id: t.id }));
}

export default async function TicketWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = tickets.find((x) => x.id === id);
  if (!t) notFound();
  const description =
    clientTickets.find((c) => c.id === t.id)?.description ?? "Client described the issue in the conversation.";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/console/tickets", label: "Service Desk" }}
        title={t.title}
        subtitle={`${t.id} · Opened ${t.opened} via ${t.channel}`}
        action={<StatusBadge status={t.status} />}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <Panel title="Request">
            <p className="text-sm">{description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{t.category}</Pill>
              <Pill tone={t.priority === "Urgent" ? "danger" : t.priority === "High" ? "warning" : "neutral"}>
                {t.priority}
              </Pill>
            </div>
          </Panel>
          <Panel title="Context">
            <dl className="space-y-2 text-sm">
              {[
                ["Client", <Link key="c" href={`/console/clients/${t.clientId}`} className="font-medium text-honey">{t.client}</Link>],
                ["Project", t.project],
                ["Venture", t.venture],
                ["Current coverage", t.coverage],
                ["Assignee", t.assignee],
                ["Hours logged", `${t.hoursLogged}h`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
        <Assessment ticket={t} />
      </div>
    </div>
  );
}
