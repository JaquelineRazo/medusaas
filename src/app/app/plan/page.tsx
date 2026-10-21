import { PageHeader, Panel, Pill, ProtoNote } from "@/components/ui";
import { plan, planOptions, projects } from "@/lib/mock";

export default function PlanPage() {
  const used = Math.round(((plan.totalDays - plan.daysLeft) / plan.totalDays) * 100);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My plan" subtitle="Support is tracked per project. Here's what covers each one." />

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Panel key={p.id} title={p.name} action={<Pill tone={p.status === "Delivered" ? "success" : "gold"}>{p.status}</Pill>}>
            <p className="text-sm">{p.coverage}</p>
            {p.status === "Delivered" && (
              <>
                <div
                  className="mt-4 h-2 rounded-full bg-cream"
                  role="progressbar"
                  aria-label="Included support used"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-2 rounded-full bg-sunshine" style={{ width: `${used}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted">{plan.daysLeft} days of included support left</p>
              </>
            )}
          </Panel>
        ))}
      </div>

      <Panel title="What included support covers" className="mt-4">
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <ul className="space-y-1.5">
            <li>✓ Bugs in what we delivered</li>
            <li>✓ Basic help using your site</li>
            <li>✓ Small fixes to the agreed scope</li>
          </ul>
          <ul className="space-y-1.5 text-muted">
            <li>– New features or sections (quoted separately)</li>
            <li>– Redesigns or new content</li>
            <li>– Issues caused by third parties</li>
          </ul>
        </div>
      </Panel>

      <h2 className="mt-8 mb-3 text-lg font-semibold">After your included month, you can continue with:</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {planOptions.map((o, i) => (
          <div
            key={o.name}
            className={`flex flex-col rounded-3xl bg-surface p-6 ${i === 0 ? "border-2 border-sunshine" : "border border-line"}`}
          >
            <p className="text-lg font-semibold">{o.name}</p>
            <p className="text-sm text-muted">{o.blurb}</p>
            <p className="mt-4 text-2xl font-bold">{o.price}</p>
            <ul className="mt-4 flex-1 space-y-1.5 text-sm">
              {o.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-6 rounded-full px-5 py-2.5 text-sm font-semibold ${
                i === 0 ? "bg-sunshine text-ink" : "border border-line"
              }`}
            >
              {o.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        With a monthly plan, you&apos;ll see the exact charge date before you confirm. Cancel anytime from
        Billing; it stops at the end of the period.
      </p>
      <ProtoNote>plan prices are placeholders until the catalog is defined.</ProtoNote>
    </div>
  );
}
