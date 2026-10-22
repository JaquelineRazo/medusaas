import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, PageHeader } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { ticketCode } from "@/lib/ticket-machine";

export default async function RequestsPage() {
  const { supabase, orgs } = await requireClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, number, title, status, updated_at, projects(name)")
    .order("updated_at", { ascending: false });
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Requests"
        subtitle="Every request you've sent us and where it stands."
        action={<ButtonLink href="/app/conversations/new">New request</ButtonLink>}
      />
      {tickets?.length ? (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/app/requests/${t.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 text-sm hover:bg-cream">
                <span className="text-muted">{ticketCode(t.number)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t.title}</span>
                  {t.projects?.name && <span className="text-muted">{t.projects.name}</span>}
                </span>
                <span className="text-muted">{fmtDateTime(t.updated_at, orgs[0]?.timezone)}</span>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No requests yet. When you need something, just ask.
        </p>
      )}
    </div>
  );
}
