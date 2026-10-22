import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel, Pill } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { eventTypeLabel } from "@/lib/calendar";
import { fmtDateTime } from "@/lib/format";
import { hostingLabel, kindLabel, supportStatus } from "@/lib/projects";
import { ticketCode } from "@/lib/ticket-machine";
import { InviteForm, ProjectForm } from "../../forms";

// Client 360: projects, people, requests and dates in one place.
export default async function Client360({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: o } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();
  const [{ data: projects }, { data: members }, { data: tickets }, { data: events }] = await Promise.all([
    supabase.from("projects").select("*").eq("organization_id", id).order("created_at"),
    supabase.from("memberships").select("role, profiles(id, full_name, email)").eq("organization_id", id),
    supabase.from("tickets").select("id, number, title, status, updated_at").eq("organization_id", id).order("updated_at", { ascending: false }),
    supabase.from("calendar_events").select("id, title, type, starts_at, staff_only").eq("organization_id", id).gte("starts_at", new Date().toISOString()).order("starts_at").limit(8),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        back={{ href: "/console/clients", label: "Clients" }}
        title={o.name}
        subtitle={[o.industry, o.city, o.timezone.replace("_", " ")].filter(Boolean).join(" · ")}
      />

      <Panel title="Projects">
        <ul className="divide-y divide-line">
          {(projects ?? []).map((p) => {
            const s = supportStatus(p.support_ends_on, o.timezone);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 text-sm">
                <span className="min-w-48 flex-1">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="text-muted">{[p.url, kindLabel[p.kind], p.stack].filter(Boolean).join(" · ")}</span>
                </span>
                <Pill>{p.venture}</Pill>
                <span className="text-muted">Hosting: {hostingLabel(p.hosting_owner, p.hosting_provider).replace("by you", "by the client")}</span>
                <span className="text-muted">Code: {p.code_owner === "razzo" ? "us" : "client"}</span>
                <Pill tone={s.active ? "success" : "neutral"}>{s.label}</Pill>
              </li>
            );
          })}
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-honey">Add a project</summary>
          <div className="mt-4"><ProjectForm orgId={o.id} /></div>
        </details>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="People">
          <ul className="mb-4 divide-y divide-line">
            {(members ?? []).map((m) => (
              <li key={m.profiles?.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-medium">{m.profiles?.full_name ?? "—"}</span>
                  <span className="text-muted">{m.profiles?.email}</span>
                </span>
                <Pill tone={m.role === "client_owner" ? "gold" : "neutral"}>{m.role === "client_owner" ? "Owner" : "Member"}</Pill>
              </li>
            ))}
          </ul>
          <InviteForm orgId={o.id} />
        </Panel>

        <Panel title="Coming up" action={<Link href="/console/calendar" className="text-sm font-medium text-honey">Calendar →</Link>}>
          {events?.length ? (
            <ul className="divide-y divide-line">
              {events.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="flex-1 font-medium">{e.title}</span>
                  <span className="text-muted">{fmtDateTime(e.starts_at, o.timezone)}</span>
                  <Pill tone={e.type === "call" ? "gold" : "neutral"}>{eventTypeLabel[e.type]}{e.staff_only ? " · staff" : ""}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing scheduled.</p>
          )}
        </Panel>
      </div>

      <Panel title="Requests">
        {tickets?.length ? (
          <ul className="divide-y divide-line">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/console/tickets/${t.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-honey">
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
  );
}
