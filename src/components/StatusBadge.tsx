import { statusLabel, type TicketStatus } from "@/lib/mock";

const tone: Record<TicketStatus | "paid", string> = {
  evaluating: "bg-soft-gold text-warning",
  needs_clarification: "bg-soft-gold text-warning",
  quote_ready: "bg-soft-gold text-honey",
  awaiting_payment: "bg-soft-gold text-warning",
  in_progress: "bg-cream text-honey",
  client_review: "bg-cream text-honey",
  completed: "bg-[#E6F4EC] text-success",
  paid: "bg-[#E6F4EC] text-success",
};

export function StatusBadge({ status }: { status: TicketStatus | "paid" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tone[status]}`}
    >
      {status === "paid" ? "Paid" : statusLabel[status]}
    </span>
  );
}
