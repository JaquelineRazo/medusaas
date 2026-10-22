import Link from "next/link";
import { ButtonLink, PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { supportStatus } from "@/lib/projects";

export default async function ClientsPage() {
  const { supabase } = await requireStaff();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, industry, city, timezone, projects(id, name, venture, support_ends_on), tickets(id, status)")
    .order("name");
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Clients" subtitle="Every company we work with." action={<ButtonLink href="/console/clients/new">New client</ButtonLink>} />
      {orgs?.length ? (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {orgs.map((o) => {
            const open = o.tickets.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
            const covered = o.projects.filter((p) => supportStatus(p.support_ends_on, o.timezone).active).length;
            return (
              <li key={o.id}>
                <Link href={`/console/clients/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 text-sm hover:bg-cream">
                  <span className="min-w-48 flex-1">
                    <span className="block font-semibold">{o.name}</span>
                    <span className="text-muted">{[o.industry, o.city].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="text-muted">{o.projects.length} project{o.projects.length === 1 ? "" : "s"}</span>
                  <span className="text-muted">{[...new Set(o.projects.map((p) => p.venture))].join(", ")}</span>
                  <span className="text-muted">{covered ? `${covered} in included support` : "No active support"}</span>
                  <span className={open ? "font-medium" : "text-muted"}>{open} open</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">No clients yet.</p>
      )}
    </div>
  );
}
