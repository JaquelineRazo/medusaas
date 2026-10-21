import { PageHeader, Pill } from "@/components/ui";
import { documents } from "@/lib/mock";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Documents" subtitle="Proposals, acceptances and terms for your projects." />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {documents.map((d) => (
          <li key={d.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
            <Pill>{d.type}</Pill>
            <span className="min-w-0 flex-1 font-medium">{d.name}</span>
            <span className="text-sm text-muted">{d.date}</span>
            <button type="button" className="text-sm font-medium text-honey">
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
