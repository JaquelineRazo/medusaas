import { PageHeader } from "@/components/ui";
import { Inbox } from "./Inbox";

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Inbox"
        subtitle="Requests from Mavi and your forms. Review, qualify and turn them into clients."
      />
      <Inbox />
    </div>
  );
}
