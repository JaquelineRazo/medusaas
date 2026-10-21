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

export type Venture = "ORNIVA" | "VARKORA" | "CYRANTA";

// ---------- Client portal (signed in as Ana, org "Tusitio") ----------

export const user = { firstName: "Ana", lastName: "López", role: "Client", org: "Tusitio" };

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
  venture: Venture;
  online: boolean;
  stack: string[];
  status: "In development" | "Delivered";
  coverage: string;
  deliveredOn?: string;
  milestones: { label: string; done: boolean; date: string }[];
  deliverables: string[];
};

export const projects: Project[] = [
  {
    id: "corporate-site",
    name: "Corporate website",
    url: "tusitio.com",
    venture: "ORNIVA",
    online: true,
    stack: ["WordPress", "Hosting", "SSL", "Backup"],
    status: "Delivered",
    coverage: "Included support until Nov 12, 2026",
    deliveredOn: "Oct 12, 2026",
    milestones: [
      { label: "Discovery and sitemap", done: true, date: "Aug 20" },
      { label: "Design approved", done: true, date: "Sep 10" },
      { label: "Build and content", done: true, date: "Oct 5" },
      { label: "Delivery accepted", done: true, date: "Oct 12" },
    ],
    deliverables: ["Home, About, Services and Contact pages", "Contact form", "Basic SEO setup"],
  },
  {
    id: "campaign-landing",
    name: "Campaign landing page",
    url: "campaign.tusitio.com",
    venture: "ORNIVA",
    online: true,
    stack: ["Webflow", "Hosting", "SSL"],
    status: "In development",
    coverage: "Covered by the project contract",
    milestones: [
      { label: "Brief and copy", done: true, date: "Oct 8" },
      { label: "Design approved", done: true, date: "Oct 16" },
      { label: "Build", done: false, date: "Oct 28" },
      { label: "Launch", done: false, date: "Nov 4" },
    ],
    deliverables: ["Landing page", "Lead form connected to email", "Analytics"],
  },
];

export type Activity = { id: string; title: string; when: string; status: TicketStatus | "paid" };

export const activity: Activity[] = [
  { id: "MS-1042", title: "New ticket: Update services section", when: "Today, 10:24 AM", status: "evaluating" },
  { id: "MS-1038", title: "Ticket closed: Contact form fix", when: "Yesterday, 4:10 PM", status: "completed" },
  { id: "INV-0007", title: "Invoice paid: Campaign landing deposit", when: "Oct 1, 2026", status: "paid" },
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

export type Quote = {
  version: number;
  effortHours: number;
  deliveryWindow: string;
  includes: string[];
  excludes: string[];
  amount: number;
  currency: string;
  payment: "Full payment" | "50% deposit";
  validUntil: string;
};

export type ClientTicket = {
  id: string;
  title: string;
  projectId: string;
  status: TicketStatus;
  coverage: "Included" | "Quoted";
  opened: string;
  updated: string;
  description: string;
  quote?: Quote;
};

export const clientTickets: ClientTicket[] = [
  {
    id: "MS-1042",
    title: "Update services section",
    projectId: "corporate-site",
    status: "evaluating",
    coverage: "Quoted",
    opened: "Oct 21, 2026",
    updated: "Today, 10:24 AM",
    description: "Change the main image and update the text of the services section.",
  },
  {
    id: "MS-1040",
    title: "Add a testimonials section",
    projectId: "corporate-site",
    status: "quote_ready",
    coverage: "Quoted",
    opened: "Oct 18, 2026",
    updated: "Oct 20, 2026",
    description: "New section on the home page with 3 client testimonials and photos.",
    quote: {
      version: 1,
      effortHours: 3,
      deliveryWindow: "2–3 business days after payment",
      includes: ["Design and layout", "Integration into your site", "Testing and publishing"],
      excludes: ["Writing the testimonials", "Photo shoot"],
      amount: 150,
      currency: "USD",
      payment: "Full payment",
      validUntil: "Oct 28, 2026",
    },
  },
  {
    id: "MS-1038",
    title: "Contact form not sending messages",
    projectId: "corporate-site",
    status: "completed",
    coverage: "Included",
    opened: "Oct 15, 2026",
    updated: "Oct 20, 2026",
    description: "The contact form stopped sending emails. Covered by included support.",
  },
];

export type Invoice = {
  id: string;
  concept: string;
  date: string;
  amount: number;
  currency: string;
  status: "Paid" | "Due" | "Overdue";
};

export const invoices: Invoice[] = [
  { id: "INV-0007", concept: "Campaign landing page · 50% deposit", date: "Oct 1, 2026", amount: 600, currency: "USD", status: "Paid" },
  { id: "INV-0005", concept: "Corporate website · Final balance", date: "Oct 12, 2026", amount: 900, currency: "USD", status: "Paid" },
  { id: "INV-0004", concept: "Corporate website · 50% deposit", date: "Aug 18, 2026", amount: 900, currency: "USD", status: "Paid" },
];

export const documents = [
  { name: "Corporate website · Proposal and scope", type: "PDF", date: "Aug 15, 2026" },
  { name: "Corporate website · Delivery acceptance", type: "PDF", date: "Oct 12, 2026" },
  { name: "Included support terms", type: "PDF", date: "Oct 12, 2026" },
  { name: "Campaign landing · Brief", type: "PDF", date: "Oct 8, 2026" },
];

export const notifications = [
  { text: "Your quote for “Add a testimonials section” is ready.", when: "Oct 20, 2026", unread: true },
  { text: "Ticket MS-1038 was completed. Take a look at your site.", when: "Oct 20, 2026", unread: true },
  { text: "Your included support for Corporate website ends on Nov 12.", when: "Oct 19, 2026", unread: false },
];

// Placeholder tiers until the founder defines the catalog (BRIEF.md §5).
export const planOptions = [
  {
    name: "Monthly plan",
    blurb: "Ongoing support + minor changes",
    price: "$49 USD / month",
    features: ["Minor changes included", "Priority response time", "Site monitoring", "Recurring card charge"],
    cta: "Activate monthly plan",
  },
  {
    name: "Pay per incident",
    blurb: "Ideal if you only need occasional support",
    price: "From $50 USD",
    features: ["Quote before any work", "Pay only when you need help", "No recurring charges"],
    cta: "Request a change",
  },
];

// ---------- Admin Workspace ----------

export type Priority = "Urgent" | "High" | "Normal" | "Low";

export type Ticket = {
  id: string;
  title: string;
  client: string;
  clientId: string;
  project: string;
  venture: Venture;
  category: "Bug" | "Change" | "Content" | "New feature" | "Incident" | "Question";
  priority: Priority;
  status: TicketStatus;
  coverage: "Warranty" | "Plan" | "Pay per incident" | "Project scope" | "To assess";
  channel: "Portal" | "Email" | "WhatsApp" | "Manual";
  opened: string;
  assignee: string;
  hoursLogged: number;
  amount?: number;
};

export const tickets: Ticket[] = [
  { id: "MS-1042", title: "Update services section", client: "Tusitio", clientId: "tusitio", project: "Corporate website", venture: "ORNIVA", category: "Content", priority: "Normal", status: "evaluating", coverage: "To assess", channel: "Portal", opened: "Today, 10:24", assignee: "—", hoursLogged: 0 },
  { id: "MS-1041", title: "Checkout page returns 500", client: "Casa Verde Café", clientId: "casa-verde", project: "Online store", venture: "ORNIVA", category: "Incident", priority: "Urgent", status: "evaluating", coverage: "To assess", channel: "WhatsApp", opened: "Today, 09:05", assignee: "Jaqueline", hoursLogged: 0.5 },
  { id: "MS-1040", title: "Add a testimonials section", client: "Tusitio", clientId: "tusitio", project: "Corporate website", venture: "ORNIVA", category: "New feature", priority: "Normal", status: "quote_ready", coverage: "Pay per incident", channel: "Portal", opened: "Oct 18", assignee: "Jaqueline", hoursLogged: 0.5, amount: 150 },
  { id: "MS-1039", title: "New report: maintenance backlog by plant", client: "Grupo Industrial Norte", clientId: "gin", project: "Asset management platform", venture: "VARKORA", category: "New feature", priority: "High", status: "awaiting_payment", coverage: "Pay per incident", channel: "Email", opened: "Oct 17", assignee: "Jaqueline", hoursLogged: 1, amount: 1200 },
  { id: "MS-1037", title: "Monthly data refresh failed", client: "Lumen Analytics", clientId: "lumen", project: "Sales data pipeline", venture: "CYRANTA", category: "Bug", priority: "High", status: "in_progress", coverage: "Plan", channel: "Portal", opened: "Oct 16", assignee: "Jaqueline", hoursLogged: 2.5 },
  { id: "MS-1036", title: "Update menu prices", client: "Casa Verde Café", clientId: "casa-verde", project: "Online store", venture: "ORNIVA", category: "Content", priority: "Low", status: "client_review", coverage: "Plan", channel: "Portal", opened: "Oct 14", assignee: "Jaqueline", hoursLogged: 1 },
  { id: "MS-1038", title: "Contact form not sending messages", client: "Tusitio", clientId: "tusitio", project: "Corporate website", venture: "ORNIVA", category: "Bug", priority: "High", status: "completed", coverage: "Warranty", channel: "Portal", opened: "Oct 15", assignee: "Jaqueline", hoursLogged: 1.5 },
];

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  ventures: Venture[];
  projects: { name: string; status: string; coverage: string }[];
  domains: string[];
  plan: string;
  balance: number;
  lifetime: number;
  hoursThisMonth: number;
  nextRenewal: string;
  notes: string;
};

export const clients: Client[] = [
  {
    id: "tusitio", name: "Tusitio", contact: "Ana López", email: "ana@tusitio.com", ventures: ["ORNIVA"],
    projects: [
      { name: "Corporate website", status: "Delivered", coverage: "Included support until Nov 12" },
      { name: "Campaign landing page", status: "In development", coverage: "Project scope" },
    ],
    domains: ["tusitio.com", "campaign.tusitio.com"], plan: "Included support", balance: 600, lifetime: 2400,
    hoursThisMonth: 3.5, nextRenewal: "Domain tusitio.com · Feb 3, 2027", notes: "Prefers WhatsApp for urgent issues; approves quotes quickly.",
  },
  {
    id: "casa-verde", name: "Casa Verde Café", contact: "Luis Herrera", email: "luis@casaverde.mx", ventures: ["ORNIVA"],
    projects: [{ name: "Online store", status: "Delivered", coverage: "Monthly plan" }],
    domains: ["casaverde.mx"], plan: "Monthly plan", balance: 0, lifetime: 3100,
    hoursThisMonth: 6, nextRenewal: "Plan · Nov 1, 2026", notes: "High support usage this month; review plan fit.",
  },
  {
    id: "gin", name: "Grupo Industrial Norte", contact: "Marcela Ruiz", email: "mruiz@gin.com.mx", ventures: ["VARKORA"],
    projects: [{ name: "Asset management platform", status: "Delivered", coverage: "Pay per incident" }],
    domains: ["activos.gin.com.mx"], plan: "Pay per incident", balance: 1200, lifetime: 10000,
    hoursThisMonth: 1, nextRenewal: "SSL · Nov 30, 2026", notes: "Quotes need purchase order from finance.",
  },
  {
    id: "lumen", name: "Lumen Analytics", contact: "Diego Ortega", email: "diego@lumen.io", ventures: ["CYRANTA"],
    projects: [{ name: "Sales data pipeline", status: "Delivered", coverage: "Monthly plan" }],
    domains: ["data.lumen.io"], plan: "Monthly plan", balance: 0, lifetime: 4800,
    hoursThisMonth: 2.5, nextRenewal: "Plan · Nov 5, 2026", notes: "",
  },
];

export type Lead = {
  id: string;
  name: string;
  email: string;
  need: string;
  venture: Venture | "Unclear";
  source: "Mavi" | "Website form" | "Referral" | "Event";
  stage: "New" | "Contacted" | "Proposal" | "Won" | "Lost";
  value?: number;
  received: string;
  transcript: { from: "client" | "bot"; text: string }[];
};

export const leads: Lead[] = [
  {
    id: "L-208", name: "Sofía Méndez", email: "sofia@estudioalba.com", need: "New website for an architecture studio, with a project gallery.",
    venture: "ORNIVA", source: "Mavi", stage: "New", received: "Today, 08:41",
    transcript: [
      { from: "client", text: "A new website" },
      { from: "bot", text: "Love it! Tell me a bit more: what should it help you or your customers do?" },
      { from: "client", text: "We're an architecture studio. We need a site with a gallery of our projects and a contact form. We like the style of minimalist portfolios." },
      { from: "bot", text: "Great, I have what I need. Where can our team reach you?" },
    ],
  },
  {
    id: "L-207", name: "Ramón Aguilar", email: "raguilar@transportesra.mx", need: "Track maintenance and fuel costs for a fleet of 40 trucks.",
    venture: "VARKORA", source: "Mavi", stage: "New", received: "Yesterday, 18:12",
    transcript: [
      { from: "client", text: "An app or system" },
      { from: "bot", text: "Love it! Tell me a bit more: what should it help you or your customers do?" },
      { from: "client", text: "We have 40 trucks and track maintenance in Excel. We want to see costs per truck and get alerts." },
      { from: "bot", text: "Great, I have what I need. Where can our team reach you?" },
    ],
  },
  { id: "L-205", name: "Clínica Santa Fe", email: "admin@clinicasf.mx", need: "Patient booking page and reminders.", venture: "ORNIVA", source: "Website form", stage: "Contacted", value: 1800, received: "Oct 18", transcript: [] },
  { id: "L-203", name: "Retail Uno", email: "bi@retailuno.com", need: "Weekly sales dashboard from their POS data.", venture: "CYRANTA", source: "Referral", stage: "Proposal", value: 3500, received: "Oct 12", transcript: [] },
  { id: "L-199", name: "Hotel Brisa", email: "gerencia@hotelbrisa.mx", need: "Website redesign with booking engine.", venture: "ORNIVA", source: "Event", stage: "Won", value: 2600, received: "Oct 2", transcript: [] },
];

export const assets = [
  { name: "tusitio.com", client: "Tusitio", type: "Website", provider: "Hostinger", tech: "WordPress 6.6", uptime: "99.98%", ssl: "Feb 3, 2027", domain: "Feb 3, 2027", status: "Online" as const },
  { name: "campaign.tusitio.com", client: "Tusitio", type: "Landing", provider: "Webflow", tech: "Webflow", uptime: "100%", ssl: "Auto", domain: "Feb 3, 2027", status: "Online" as const },
  { name: "casaverde.mx", client: "Casa Verde Café", type: "Store", provider: "SiteGround", tech: "WooCommerce", uptime: "97.2%", ssl: "Dec 2, 2026", domain: "Nov 15, 2026", status: "Down" as const },
  { name: "activos.gin.com.mx", client: "Grupo Industrial Norte", type: "App", provider: "AWS", tech: "Next.js + Postgres", uptime: "99.9%", ssl: "Nov 30, 2026", domain: "Client-owned", status: "Online" as const },
  { name: "data.lumen.io", client: "Lumen Analytics", type: "Pipeline", provider: "GCP", tech: "Python + BigQuery", uptime: "—", ssl: "Auto", domain: "Client-owned", status: "Degraded" as const },
];

export const revenue = {
  collectedThisMonth: 2700,
  outstanding: 1800,
  mrr: 98,
  currency: "USD",
  receivables: [
    { client: "Grupo Industrial Norte", concept: "MS-1039 · Maintenance backlog report", amount: 1200, due: "Awaiting payment", overdue: false },
    { client: "Tusitio", concept: "Campaign landing · Final balance", amount: 600, due: "Due at delivery (Nov 4)", overdue: false },
  ],
  subscriptions: [
    { client: "Casa Verde Café", plan: "Monthly plan", amount: 49, next: "Nov 1, 2026", status: "Active" },
    { client: "Lumen Analytics", plan: "Monthly plan", amount: 49, next: "Nov 5, 2026", status: "Active" },
  ],
};

export const automations = [
  { name: "Acknowledge new requests", trigger: "ticket.submitted", action: "Email + in-app message to client", on: true },
  { name: "Quote approval reminder", trigger: "quote.issued + 2 days without approval", action: "Email reminder", on: true },
  { name: "Payment follow-up", trigger: "payment.pending + 3 days", action: "Email with payment link", on: true },
  { name: "Included support expiring", trigger: "coverage ends in 14 / 7 / 1 days", action: "Email with plan options", on: true },
  { name: "Site down alert", trigger: "monitor.incident_opened", action: "Notify admin + create ticket", on: false },
  { name: "Feedback after closing", trigger: "ticket.closed", action: "One-question satisfaction survey", on: false },
];
