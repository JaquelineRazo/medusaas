import { PageHeader } from "@/components/ui";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Documents" subtitle="Proposals, deliveries and agreements for your projects." />
      <p className="rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
        No documents yet. We&apos;ll add proposals, delivery records and agreements here.
      </p>
    </div>
  );
}
