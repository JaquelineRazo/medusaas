import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { clientLabel, ticketCode, type TicketStatus } from "@/lib/ticket-machine";

const steps: TicketStatus[] = ["new", "evaluating", "quote_ready", "in_progress", "client_review", "completed"];

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgs } = await requireClient();
  const tz = orgs[0]?.timezone;
  const { data: t } = await supabase.from("tickets").select("*, projects(name)").eq("id", id).maybeSingle();
  if (!t) notFound();
  const { data: history } = await supabase.from("ticket_events").select("id, to_status, note, created_at").eq("ticket_id", id).order("id");
  const reached = Math.max(0, steps.indexOf(t.status === "awaiting_payment" ? "quote_ready" : t.status));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ href: "/app/requests", label: "Requests" }}
        title={t.title}
        subtitle={[ticketCode(t.number), t.projects?.name].filter(Boolean).join(" · ")}
        action={<StatusBadge status={t.status} />}
      />
      {t.status !== "cancelled" && (
        <ol className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s} className="text-xs">
              <span className={`mb-1.5 block h-1.5 rounded-full ${i <= reached ? "bg-sunshine" : "bg-line"}`} />
              <span className={i <= reached ? "font-medium" : "text-muted"}>{clientLabel[s]}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Panel title="What you asked">
          <p className="text-sm whitespace-pre-line">{t.description || "—"}</p>
        </Panel>
        <Panel title="History">
          <ol className="space-y-3">
            {(history ?? []).map((h) => (
              <li key={h.id} className="text-sm">
                <p className="font-medium">{clientLabel[h.to_status]}</p>
                <p className="text-xs text-muted">{fmtDateTime(h.created_at, tz)}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
      <p className="mt-4 text-sm text-muted">
        We review every request before any work or charge. If it needs a quote, you&apos;ll see it here and get an email.
      </p>
    </div>
  );
}
