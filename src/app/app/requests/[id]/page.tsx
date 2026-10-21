import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, Panel, Pill } from "@/components/ui";
import { clientTickets, projects } from "@/lib/mock";
import { QuoteCard } from "./QuoteCard";

export function generateStaticParams() {
  return clientTickets.map((t) => ({ id: t.id }));
}

const steps = ["Under review", "Quote ready", "Payment", "In progress", "Your review", "Completed"];
const stepIndex: Record<string, number> = {
  evaluating: 0,
  needs_clarification: 0,
  quote_ready: 1,
  awaiting_payment: 2,
  in_progress: 3,
  client_review: 4,
  completed: 5,
};

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = clientTickets.find((x) => x.id === id);
  if (!t) notFound();
  const project = projects.find((p) => p.id === t.projectId);
  const at = stepIndex[t.status];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ href: "/app/requests", label: "Requests" }}
        title={t.title}
        subtitle={`${t.id} · ${project?.name} · Opened ${t.opened}`}
        action={<StatusBadge status={t.status} />}
      />

      <Panel className="mb-4">
        <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <span
                aria-hidden="true"
                className={`mx-auto block h-2 rounded-full ${i <= at ? "bg-sunshine" : "bg-cream"}`}
              />
              <span className={`mt-2 block text-xs ${i === at ? "font-semibold" : "text-muted"}`}>{s}</span>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="What you asked for">
          <p className="text-sm">{t.description}</p>
          <div className="mt-4">
            <Pill tone={t.coverage === "Included" ? "success" : "neutral"}>
              {t.coverage === "Included" ? "Covered by included support · $0" : "Requires a quote"}
            </Pill>
          </div>
        </Panel>
        {t.quote ? (
          <QuoteCard ticketId={t.id} quote={t.quote} />
        ) : (
          <Panel title="Quote">
            <p className="text-sm text-muted">
              {t.status === "completed"
                ? "This request was covered by your included support. No charge."
                : "Our team is assessing the work. You'll see the scope, estimated effort, delivery window and price here, usually within 1 business day."}
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
