import { Calendar } from "@/components/Calendar";
import { ButtonLink, PageHeader } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { toCalEvent } from "@/lib/calendar";
import { todayIn } from "@/lib/format";

// RLS already hides other organizations and staff-only items.
export default async function ClientCalendar() {
  const { supabase, tz } = await requireClient();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, type, title, starts_at, all_day, minutes, location, staff_only, organization_id, organizations(name), projects(name)")
    .order("starts_at");
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Calendar"
        subtitle="Our calls, your project milestones and every key date, in one place."
        action={<ButtonLink href="/app/conversations/new?intent=change">Request a call</ButtonLink>}
      />
      <Calendar mode="client" tz={tz} today={todayIn(tz)} events={(data ?? []).map((r) => toCalEvent(r, tz))} />
    </div>
  );
}
