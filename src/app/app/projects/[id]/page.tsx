import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, PageHeader, Panel, Pill } from "@/components/ui";
import { clientTickets, projects } from "@/lib/mock";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projects.find((x) => x.id === id);
  if (!p) notFound();
  const requests = clientTickets.filter((t) => t.projectId === p.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/app/projects", label: "My projects" }}
        title={p.name}
        subtitle={`${p.url} · ${p.venture}`}
        action={<ButtonLink href="/app/conversations/new">Request a change</ButtonLink>}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title="Milestones">
            <ol className="space-y-3">
              {p.milestones.map((m) => (
                <li key={m.label} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 shrink-0 rounded-full ${m.done ? "bg-sunshine" : "border-2 border-line"}`}
                  />
                  <span className={`flex-1 text-sm ${m.done ? "font-medium" : "text-muted"}`}>{m.label}</span>
                  <span className="text-xs text-muted">{m.date}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Requests for this project">
            {requests.length === 0 ? (
              <p className="text-sm text-muted">No requests yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {requests.map((t) => (
                  <li key={t.id}>
                    <Link href={`/app/requests/${t.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-honey">
                      <span className="text-muted">{t.id}</span>
                      <span className="flex-1 font-medium">{t.title}</span>
                      <StatusBadge status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Status">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Project</dt>
                <dd><Pill tone={p.status === "Delivered" ? "success" : "gold"}>{p.status}</Pill></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Site</dt>
                <dd className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> Online
                </dd>
              </div>
              {p.deliveredOn && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Delivered</dt>
                  <dd>{p.deliveredOn}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Support</dt>
                <dd className="text-right">{p.coverage}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Deliverables">
            <ul className="space-y-1.5 text-sm">
              {p.deliverables.map((d) => (
                <li key={d}>✓ {d}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Stack">
            <div className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
