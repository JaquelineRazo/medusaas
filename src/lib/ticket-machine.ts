// Ticket state machine. The database enforces the same rules in
// public.ticket_transition_allowed() and public.transition_ticket(); keep both in sync.

export type TicketStatus =
  | "new"
  | "evaluating"
  | "quote_ready"
  | "awaiting_payment"
  | "in_progress"
  | "client_review"
  | "completed"
  | "cancelled";

export type Coverage = "to_assess" | "included" | "plan" | "warranty" | "pay_per_incident";

const transitions: Record<TicketStatus, TicketStatus[]> = {
  new: ["evaluating", "cancelled"],
  evaluating: ["quote_ready", "in_progress", "cancelled"],
  quote_ready: ["awaiting_payment", "evaluating", "cancelled"],
  awaiting_payment: ["in_progress", "cancelled"],
  in_progress: ["client_review"],
  client_review: ["in_progress", "completed"],
  completed: [],
  cancelled: [],
};

const covered: Coverage[] = ["included", "plan", "warranty"];

/** Why a staff member can't move a ticket, or null if they can. */
export function blockedReason(from: TicketStatus, to: TicketStatus, coverage: Coverage): string | null {
  if (!transitions[from].includes(to)) return `A request can't go from ${from} to ${to}.`;
  if (to === "in_progress" && from === "evaluating" && !covered.includes(coverage))
    return "Only covered work (included support, plan or warranty) can start without a paid quote.";
  if (to === "in_progress" && from === "awaiting_payment")
    return "Work starts automatically when the payment is confirmed.";
  return null;
}

/** Next statuses a staff member can choose from the UI. */
export function nextSteps(from: TicketStatus, coverage: Coverage): TicketStatus[] {
  return transitions[from].filter((to) => blockedReason(from, to, coverage) === null);
}

// What the client sees (COPY.md "Client-facing status labels").
export const clientLabel: Record<TicketStatus, string> = {
  new: "Received",
  evaluating: "Under review",
  quote_ready: "Quote ready",
  awaiting_payment: "Awaiting payment",
  in_progress: "In progress",
  client_review: "Ready for your review",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ticketCode = (n: number) => `MS-${n}`;
