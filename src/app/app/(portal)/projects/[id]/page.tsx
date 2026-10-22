import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { hostingLabel, kindLabel, supportStatus } from "@/lib/projects";
import { ticketCode } from "@/lib/ticket-machine";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgs } = await requireClient();
  const tz = orgs[0]?.timezone;
  // RLS returns nothing for a project outside the client's organizations.
  const { data: p } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [{ data: tickets }, { data: events }] = await Promise.all([
    supabase.from("tickets").select("id, number, title, status").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("calendar_events").select("id, title, type, starts_at").eq("project_id", id).order("starts_at"),
  ]);
  const s = supportStatus(p.support_ends_on, tz);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/app/projects", label: "My projects" }}
        title={p.name}
        subtitle={[p.url, kindLabel[p.kind]].filter(Boolean).join(" · ")}
        action={<ButtonLink href={`/app/conversations/new?project=${p.id}`}>Request a change</ButtonLink>}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title="Key dates">
            {events?.length ? (
              <ol className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 text-sm">
                    <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${new Date(e.starts_at) < new Date() ? "bg-sunshine" : "border-2 border-line"}`} />
                    <span className="flex-1 font-medium">{e.title}</span>
                    <span className="text-xs text-muted">{fmtDate(e.starts_at, tz)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No dates scheduled for this project.</p>
            )}
          </Panel>
          <Panel title="Requests for this project">
            {tickets?.length ? (
              <ul className="divide-y divide-line">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link href={`/app/requests/${t.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-honey">
                      <span className="text-muted">{ticketCode(t.number)}</span>
                      <span className="flex-1 font-medium">{t.title}</span>
                      <StatusBadge status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No requests yet.</p>
            )}
          </Panel>
        </div>
        <Panel title="Details">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted">Support</dt><dd className="font-medium">{s.label}</dd></div>
            <div><dt className="text-muted">Built with</dt><dd className="font-medium">{p.stack ?? "—"}</dd></div>
            <div><dt className="text-muted">Hosting</dt><dd className="font-medium">{hostingLabel(p.hosting_owner, p.hosting_provider)}</dd></div>
            <div><dt className="text-muted">Code</dt><dd className="font-medium">{p.code_owner === "razzo" ? "Kept safe by our team" : "In your accounts"}</dd></div>
          </dl>
          {!s.active && (
            <Link href="/app/plan" className="mt-5 inline-block text-sm font-medium text-honey">Keep this project covered →</Link>
          )}
        </Panel>
      </div>
    </div>
  );
}
