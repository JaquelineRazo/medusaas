import { PageHeader } from "@/components/ui";

// Invoices and payments arrive with Stripe in Phase 3 (BRIEF.md §4).
export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" subtitle="Your quotes, payments and invoices." />
      <p className="rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
        Nothing here yet. Quotes you approve and payments you make will appear here, with a receipt for each one.
      </p>
    </div>
  );
}
