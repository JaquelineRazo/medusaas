import { PageHeader, Pill, money } from "@/components/ui";
import { leads, type Lead } from "@/lib/mock";

const stages: Lead["stage"][] = ["New", "Contacted", "Proposal", "Won", "Lost"];

export default function GrowthCRM() {
  const pipeline = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").reduce((s, l) => s + (l.value ?? 0), 0);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Growth CRM"
        subtitle={`Leads from Mavi, forms, referrals and events across all ventures · Open pipeline ${money(pipeline)}`}
      />
      <div className="grid gap-4 md:grid-cols-5">
        {stages.map((s) => {
          const items = leads.filter((l) => l.stage === s);
          return (
            <section key={s} className="rounded-3xl bg-surface p-4">
              <h2 className="mb-3 flex items-center justify-between text-sm font-semibold">
                {s} <span className="text-muted">{items.length}</span>
              </h2>
              <ul className="space-y-2">
                {items.map((l) => (
                  <li key={l.id} className="rounded-2xl border border-line p-3 text-sm">
                    <p className="font-medium">{l.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{l.need}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Pill tone={l.source === "Mavi" ? "gold" : "neutral"}>{l.source}</Pill>
                      <Pill>{l.venture}</Pill>
                    </div>
                    {l.value && <p className="mt-2 text-xs font-semibold">{money(l.value)}</p>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
