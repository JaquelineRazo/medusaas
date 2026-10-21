import Link from "next/link";
import { PageHeader, Pill } from "@/components/ui";
import { projects } from "@/lib/mock";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My projects" subtitle="Everything we've built or are building for you." />
      <ul className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/app/projects/${p.id}`}
              className="block h-full rounded-3xl border border-line bg-surface p-6 hover:border-sunshine"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="text-sm text-muted">{p.url}</p>
                </div>
                <Pill tone={p.status === "Delivered" ? "success" : "gold"}>{p.status}</Pill>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                {p.online ? "Online" : "Offline"}
              </p>
              <p className="mt-2 text-sm text-muted">{p.coverage}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
