import { clientLabel, type TicketStatus } from "@/lib/ticket-machine";

const tone: Record<TicketStatus, string> = {
  new: "bg-soft-gold text-warning",
  evaluating: "bg-soft-gold text-warning",
  quote_ready: "bg-soft-gold text-honey",
  awaiting_payment: "bg-soft-gold text-warning",
  in_progress: "bg-cream text-honey",
  client_review: "bg-cream text-honey",
  completed: "bg-[#E6F4EC] text-success",
  cancelled: "border border-line text-muted",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tone[status]}`}>
      {clientLabel[status]}
    </span>
  );
}
