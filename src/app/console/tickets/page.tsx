import { PageHeader } from "@/components/ui";
import { TicketTable } from "./TicketTable";

export default function ServiceDesk() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Service Desk"
        subtitle="Every ticket is assessed, even when it's covered at $0."
        action={
          <button type="button" className="rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink">
            New ticket
          </button>
        }
      />
      <TicketTable />
    </div>
  );
}
