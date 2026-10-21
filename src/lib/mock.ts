// Prototype data only (Phase 1). Prices are placeholders, not an approved rate card.

export type TicketStatus =
  | "evaluating"
  | "needs_clarification"
  | "quote_ready"
  | "awaiting_payment"
  | "in_progress"
  | "client_review"
  | "completed";

// Client-facing labels: ../razzo-strategy/06_medusaas/COPY.md
export const statusLabel: Record<TicketStatus, string> = {
  evaluating: "Under review",
  needs_clarification: "Needs your input",
  quote_ready: "Quote ready",
  awaiting_payment: "Awaiting payment",
  in_progress: "In progress",
  client_review: "Ready for your review",
  completed: "Completed",
};

export const user = { firstName: "Ana", lastName: "López", role: "Client" };

export const plan = {
  name: "Included support",
  validUntil: "Nov 12, 2026",
  daysLeft: 22,
  totalDays: 31,
};

export type Project = {
  id: string;
  name: string;
  url: string;
  venture: string;
  online: boolean;
  stack: string[];
};

export const projects: Project[] = [
  {
    id: "corporate-site",
    name: "Corporate website",
    url: "tusitio.com",
    venture: "ORNIVA",
    online: true,
    stack: ["WordPress", "Hosting", "SSL", "Backup"],
  },
  {
    id: "campaign-landing",
    name: "Campaign landing page",
    url: "campaign.tusitio.com",
    venture: "ORNIVA",
    online: true,
    stack: ["Webflow", "Hosting", "SSL"],
  },
];

export type Activity = {
  id: string;
  title: string;
  when: string;
  status: TicketStatus | "paid";
};

export const activity: Activity[] = [
  {
    id: "MS-1042",
    title: "New ticket: Update services section",
    when: "Today, 10:24 AM",
    status: "evaluating",
  },
  {
    id: "MS-1038",
    title: "Ticket closed: Contact form fix",
    when: "Yesterday, 4:10 PM",
    status: "completed",
  },
  {
    id: "INV-0007",
    title: "Invoice paid: Monthly plan",
    when: "Oct 1, 2026",
    status: "paid",
  },
];

export const sampleQuote = {
  ticketId: "MS-1043",
  version: 1,
  title: "Testimonials section on the home page",
  effortHours: 3,
  deliveryWindow: "2–3 business days after payment",
  includes: ["Design and layout", "Integration into your site", "Testing and publishing"],
  amount: 150,
  currency: "USD",
  validUntil: "Oct 28, 2026",
};
