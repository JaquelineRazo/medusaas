import { PageHeader, Pill, ProtoNote } from "@/components/ui";
import { automations } from "@/lib/mock";

export default function AutomationsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Automations" subtitle="Follow-ups that run on their own, so nothing depends on memory." />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {automations.map((a) => (
          <li key={a.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-sm">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{a.name}</span>
              <span className="text-muted">
                When <code className="rounded bg-cream px-1">{a.trigger}</code> → {a.action}
              </span>
            </span>
            <Pill tone={a.on ? "success" : "neutral"}>{a.on ? "On" : "Off"}</Pill>
          </li>
        ))}
      </ul>
      <ProtoNote>AI helpers (classify, summarize, draft quotes) come later and always need your approval.</ProtoNote>
    </div>
  );
}
