import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, PageHeader, Pill } from "@/components/ui";
import { clientTickets, projects } from "@/lib/mock";

export default function RequestsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Requests"
        subtitle="Every request is reviewed by a person. You approve the cost before we start."
        action={<ButtonLink href="/app/conversations/new">New request</ButtonLink>}
      />
      <ul className="space-y-3">
        {clientTickets.map((t) => (
          <li key={t.id}>
            <Link
              href={`/app/requests/${t.id}`}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-surface p-4 hover:border-sunshine"
            >
              <span className="text-sm text-muted">{t.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t.title}</span>
                <span className="text-sm text-muted">
                  {projects.find((p) => p.id === t.projectId)?.name} · Updated {t.updated}
                </span>
              </span>
              <Pill tone={t.coverage === "Included" ? "success" : "neutral"}>
                {t.coverage === "Included" ? "Included support" : "Quoted"}
              </Pill>
              <StatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
