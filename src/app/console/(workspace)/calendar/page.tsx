import { Calendar } from "@/components/Calendar";
import { PageHeader, Panel } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { toCalEvent } from "@/lib/calendar";
import { DEFAULT_TZ, todayIn } from "@/lib/format";
import { EventForm } from "../forms";

export default async function AdminCalendar() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: orgs }] = await Promise.all([
    supabase.from("calendar_events").select("id, type, title, starts_at, all_day, minutes, location, staff_only, organization_id, organizations(name), projects(name)").order("starts_at"),
    supabase.from("organizations").select("id, name, timezone").order("name"),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Calendar" subtitle="Every call and key date across clients, in Mexico City time. Each client sees their own, except staff-only items." />
      <Calendar mode="admin" tz={DEFAULT_TZ} today={todayIn()} events={(data ?? []).map((r) => toCalEvent(r))} />
      {orgs?.length ? (
        <Panel title="Schedule a call or key date" className="mt-4">
          <EventForm orgs={orgs} />
        </Panel>
      ) : null}
    </div>
  );
}
