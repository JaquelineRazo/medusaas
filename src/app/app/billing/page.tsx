import { PageHeader, Panel, Pill, Stat, money } from "@/components/ui";
import { invoices } from "@/lib/mock";

export default function BillingPage() {
  const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" subtitle="Quotes, payments and receipts in one place." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Due now" value={money(0)} hint="Nothing pending" />
        <Stat label="Next scheduled" value={money(600)} hint="Campaign landing balance · at delivery" />
        <Stat label="Paid to date" value={money(paid)} />
      </div>

      <Panel title="Payment history" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2 font-medium">Receipt</th>
                <th className="pb-2 font-medium">Concept</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="py-3 text-muted">{i.id}</td>
                  <td className="py-3 font-medium">{i.concept}</td>
                  <td className="py-3 text-muted">{i.date}</td>
                  <td className="py-3 text-right">{money(i.amount, i.currency)}</td>
                  <td className="py-3 text-right">
                    <Pill tone={i.status === "Paid" ? "success" : i.status === "Overdue" ? "danger" : "warning"}>
                      {i.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Payment method" className="mt-4">
        <p className="text-sm text-muted">
          Cards are stored securely by our payment provider (Stripe). We never see or store your full card
          number.
        </p>
        <button type="button" className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
          Manage payment methods
        </button>
      </Panel>
    </div>
  );
}
