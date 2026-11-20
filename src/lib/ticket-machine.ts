// Ticket vocabulary and state machine, safe for the browser. Part of the Ticket lifecycle
// module; the server half (openRequest, moveTicket) lives in tickets.ts.
// The database has the final word in public.ticket_transition_allowed() and
// public.transition_ticket(); tests/transition-drift.test.ts fails if the two disagree.

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

export const ticketStatuses = Object.keys(transitions) as TicketStatus[];

/** Whether the state machine has this edge at all (coverage and payment rules aside). */
export const isTransition = (from: TicketStatus, to: TicketStatus) => transitions[from].includes(to);

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

/**
 * Statuses the console offers. From assessment it includes "in_progress" because coverage
 * is chosen in the same form (moveTicket still refuses it unless the work is covered).
 * awaiting_payment → in_progress belongs to the payment webhook, never to a person.
 */
export function staffNextSteps(from: TicketStatus): TicketStatus[] {
  return transitions[from].filter((to) => !(from === "awaiting_payment" && to === "in_progress"));
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

// What a client can ask for in a conversation; the label prefixes the ticket title.
export const requestKinds = { issue: "Issue", change: "Change", new: "New", question: "Question" } as const;
export type RequestKind = keyof typeof requestKinds;
