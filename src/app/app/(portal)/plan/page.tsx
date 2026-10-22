import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { supportStatus } from "@/lib/projects";

const options = [
  {
    name: "Monthly plan",
    pitch: "Your project looked after every month.",
    features: ["Requests reviewed first", "Small changes and fixes included", "Monitoring and updates", "Cancel any time"],
  },
  {
    name: "Pay per incident",
    pitch: "Only when you need us.",
    features: ["A clear quote before any work", "Pay only what you approve", "No recurring charges"],
  },
];

export default async function PlanPage() {
  const { supabase, orgs } = await requireClient();
  const { data: projects } = await supabase.from("projects").select("id, name, support_ends_on").neq("status", "archived").order("created_at");
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My plan" subtitle="How each of your projects is covered." />
      <ul className="grid gap-4 md:grid-cols-2">
        {(projects ?? []).map((p) => {
          const s = supportStatus(p.support_ends_on, orgs[0]?.timezone);
          return (
            <li key={p.id} className="rounded-3xl border border-line bg-surface p-6">
              <p className="font-semibold">{p.name}</p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${s.active ? "bg-success" : "bg-muted"}`} />
                {s.label}
              </p>
              {s.active && s.days !== null && <p className="mt-1 text-sm text-muted">{s.days} days left. Fixes to what we delivered are covered.</p>}
              {!s.active && <p className="mt-1 text-sm text-muted">Requests are quoted before any work.</p>}
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Keep your projects covered</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map((o) => (
          <Panel key={o.name} title={o.name}>
            <p className="-mt-2 text-sm text-muted">{o.pitch}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {o.features.map((f) => (
                <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-success">✓</span>{f}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      <div className="mt-6">
        <ButtonLink href="/app/conversations/new?intent=change">Talk to us about a plan</ButtonLink>
      </div>
    </div>
  );
}
