import { Calendar } from "@/components/Calendar";
import { ButtonLink, PageHeader } from "@/components/ui";
import { events } from "@/lib/mock";

// The client only sees their own dates; staff-only items (e.g. SSL renewals) stay hidden.
export default function ClientCalendar() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Calendar"
        subtitle="Our calls, your project milestones and every key date, in one place."
        action={<ButtonLink href="/app/conversations/new">Request a call</ButtonLink>}
      />
      <Calendar mode="client" events={events.filter((e) => e.clientId === "tusitio" && !e.staffOnly)} />
    </div>
  );
}
