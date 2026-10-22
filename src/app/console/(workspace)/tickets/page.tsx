import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Pill } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { ticketCode } from "@/lib/ticket-machine";

const priorityTone = { urgent: "danger", high: "warning", normal: "neutral", low: "neutral" } as const;

export default async function ServiceDesk({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const { supabase } = await requireStaff();
  let q = supabase
    .from("tickets")
    .select("id, number, title, status, priority, coverage, updated_at, organizations(name), projects(name)")
    .order("updated_at", { ascending: false });
  if (show !== "all") q = q.not("status", "in", "(completed,cancelled)");
  const { data: tickets } = await q;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Service Desk"
        subtitle="Every request is assessed before any work, even when it's covered."
        action={
          <Link href={show === "all" ? "/console/tickets" : "/console/tickets?show=all"} className="text-sm font-medium text-honey">
            {show === "all" ? "Open only" : "Show closed too"}
          </Link>
        }
      />
      {tickets?.length ? (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/console/tickets/${t.id}`} className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-4 text-sm hover:bg-cream">
                <span className="w-16 text-muted">{ticketCode(t.number)}</span>
                <span className="min-w-56 flex-1">
                  <span className="block font-medium">{t.title}</span>
                  <span className="text-muted">{[t.organizations?.name, t.projects?.name].filter(Boolean).join(" · ")}</span>
                </span>
                <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                <span className="text-muted">{fmtDateTime(t.updated_at)}</span>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">No open requests.</p>
      )}
    </div>
  );
}
