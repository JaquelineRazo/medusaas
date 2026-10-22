import { Calendar } from "@/components/Calendar";
import { PageHeader, ProtoNote } from "@/components/ui";
import { events } from "@/lib/mock";

export default function AdminCalendar() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Calendar"
        subtitle="Every call and key date across clients. Each client sees their own, except staff-only items."
        action={
          <button type="button" className="rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95">
            Schedule a call
          </button>
        }
      />
      <Calendar mode="admin" events={events} />
      <ProtoNote>scheduling a call will create the Google Meet link, email the invitation and add it to the client&apos;s calendar.</ProtoNote>
    </div>
  );
}
