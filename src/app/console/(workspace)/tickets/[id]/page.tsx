import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel, Pill } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { clientLabel, nextSteps, ticketCode, type TicketStatus } from "@/lib/ticket-machine";
import { MoveTicketForm } from "../../forms";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: t } = await supabase.from("tickets").select("*, organizations(id, name), projects(name), profiles(full_name, email)").eq("id", id).maybeSingle();
  if (!t) notFound();
  const { data: history } = await supabase.from("ticket_events").select("id, from_status, to_status, note, created_at, profiles(full_name)").eq("ticket_id", id).order("id");
  // From assessment, "In progress" is offered because coverage is chosen in the same form;
  // the server (and the database) still refuse it unless the work is covered.
  // awaiting_payment → in_progress belongs to the payment webhook, never to a person.
  const steps: TicketStatus[] =
    t.status === "evaluating" ? ["quote_ready", "in_progress", "cancelled"] : nextSteps(t.status, t.coverage);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/console/tickets", label: "Service Desk" }}
        title={t.title}
        subtitle={`${ticketCode(t.number)} · ${t.organizations?.name}${t.projects?.name ? ` · ${t.projects.name}` : ""}`}
        action={<StatusBadge status={t.status} />}
      />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Panel title="Request">
            <p className="text-sm whitespace-pre-line">{t.description || "—"}</p>
            <p className="mt-4 text-xs text-muted">
              From {t.profiles?.full_name ?? t.profiles?.email ?? "staff"} · {fmtDateTime(t.created_at)} · priority <Pill>{t.priority}</Pill>
            </p>
            <Link href={`/console/clients/${t.organizations?.id}`} className="mt-3 inline-block text-sm font-medium text-honey">Client 360 →</Link>
          </Panel>
          <Panel title="Assessment">
            <MoveTicketForm id={t.id} steps={steps} coverage={t.coverage} />
          </Panel>
        </div>
        <Panel title="History">
          <ol className="space-y-4">
            {(history ?? []).map((h) => (
              <li key={h.id} className="text-sm">
                <p className="font-medium">
                  {h.from_status ? `${clientLabel[h.from_status]} → ` : ""}
                  {clientLabel[h.to_status]}
                </p>
                <p className="text-xs text-muted">{h.profiles?.full_name ?? "—"} · {fmtDateTime(h.created_at)}</p>
                {h.note && <p className="mt-1 rounded-xl bg-cream px-3 py-2 text-xs">{h.note}</p>}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
