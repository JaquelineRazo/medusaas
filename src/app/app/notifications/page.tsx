import { PageHeader } from "@/components/ui";
import { notifications } from "@/lib/mock";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {notifications.map((n) => (
          <li key={n.text} className="flex items-start gap-3 px-5 py-4">
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-sunshine" : "bg-transparent"}`}
            />
            <span className={`flex-1 text-sm ${n.unread ? "font-medium" : "text-muted"}`}>
              {n.text}
              {n.unread && <span className="sr-only"> (unread)</span>}
            </span>
            <span className="text-xs text-muted">{n.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
