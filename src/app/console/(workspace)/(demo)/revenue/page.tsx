import { PageHeader, Panel, Pill, Stat, money } from "@/components/ui";
import { revenue } from "@/lib/mock";

export default function RevenueCenter() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Revenue Center" subtitle="Approve → Pay → Execute. Nothing billable starts before payment is confirmed." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Collected this month" value={money(revenue.collectedThisMonth)} />
        <Stat label="Outstanding" value={money(revenue.outstanding)} />
        <Stat label="Monthly recurring" value={money(revenue.mrr)} hint={`${revenue.subscriptions.length} active plans`} />
      </div>

      <Panel title="Receivables" className="mt-4">
        <ul className="divide-y divide-line">
          {revenue.receivables.map((r) => (
            <li key={r.concept} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{r.client}</span>
                <span className="text-muted">{r.concept}</span>
              </span>
              <span className="text-muted">{r.due}</span>
              <span className="font-semibold">{money(r.amount)}</span>
              <button type="button" className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:bg-cream">
                Copy payment link
              </button>
              <button type="button" className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:bg-cream">
                Send reminder
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Subscriptions" className="mt-4">
        <ul className="divide-y divide-line">
          {revenue.subscriptions.map((s) => (
            <li key={s.client} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
              <span className="min-w-0 flex-1 font-medium">{s.client}</span>
              <span className="text-muted">{s.plan}</span>
              <span>{money(s.amount)} / month</span>
              <span className="text-muted">Next charge {s.next}</span>
              <Pill tone="success">{s.status}</Pill>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
