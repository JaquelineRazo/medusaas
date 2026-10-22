import { DEFAULT_TZ } from "./format";

export type EventType = "call" | "milestone" | "delivery" | "payment" | "coverage" | "renewal";

export const eventTypeLabel: Record<EventType, string> = {
  call: "Call",
  milestone: "Milestone",
  delivery: "Delivery",
  payment: "Payment",
  coverage: "Support",
  renewal: "Renewal",
};

// Shape the Calendar component draws: dates already resolved in the viewer's time zone.
export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  minutes?: number;
  title: string;
  type: EventType;
  client: string;
  clientId: string;
  project?: string;
  where?: string;
  href?: string;
  staffOnly?: boolean;
  startsAt?: string; // ISO, for the .ics file
};

type Row = {
  id: string;
  type: EventType;
  title: string;
  starts_at: string;
  all_day: boolean;
  minutes: number | null;
  location: string | null;
  staff_only: boolean;
  organization_id: string;
  organizations?: { name: string } | null;
  projects?: { name: string } | null;
};

export function toCalEvent(r: Row, tz = DEFAULT_TZ): CalEvent {
  const d = new Date(r.starts_at);
  return {
    id: r.id,
    date: d.toLocaleDateString("en-CA", { timeZone: tz }),
    time: r.all_day ? undefined : d.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }),
    minutes: r.minutes ?? undefined,
    title: r.title,
    type: r.type,
    client: r.organizations?.name ?? "",
    clientId: r.organization_id,
    project: r.projects?.name ?? undefined,
    where: r.location ?? undefined,
    staffOnly: r.staff_only,
    startsAt: r.starts_at,
  };
}
