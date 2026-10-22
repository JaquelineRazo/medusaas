import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { hostingLabel, kindLabel, supportStatus } from "@/lib/projects";

export default async function ProjectsPage() {
  const { supabase, orgs } = await requireClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, kind, url, stack, hosting_owner, hosting_provider, support_ends_on")
    .neq("status", "archived")
    .order("created_at");
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My projects" subtitle="Everything we've built with you." />
      <ul className="grid gap-4 md:grid-cols-2">
        {(projects ?? []).map((p) => {
          const s = supportStatus(p.support_ends_on, orgs[0]?.timezone);
          return (
            <li key={p.id}>
              <Link href={`/app/projects/${p.id}`} className="block h-full rounded-3xl border border-line bg-surface p-6 hover:border-ink">
                <p className="text-xs text-muted">{kindLabel[p.kind]}{p.stack ? ` · ${p.stack}` : ""}</p>
                <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
                {p.url && <p className="text-sm text-muted">{p.url}</p>}
                <p className="mt-4 flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${s.active ? "bg-success" : "bg-muted"}`} />
                  {s.label}
                </p>
                <p className="mt-1 text-sm text-muted">Hosting: {hostingLabel(p.hosting_owner, p.hosting_provider)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
