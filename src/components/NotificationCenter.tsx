import { PageHeader, Panel, ProtoNote } from "@/components/ui";
import type { Notice } from "./NotificationBell";

type Topic = { label: string; hint: string; required?: boolean };

// Full list + email preferences. The bell shows the same items; each one is also emailed.
export function NotificationCenter({ items, email, topics }: { items: Notice[]; email: string; topics: Topic[] }) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={`Everything here is also sent to ${email}.`} />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {items.map((n) => (
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

      <Panel title="Email notifications" className="mt-6">
        <p className="-mt-2 mb-4 text-sm text-muted">
          Sent to <span className="font-medium text-ink">{email}</span>. Change this address in your account.
        </p>
        <ul className="divide-y divide-line">
          {topics.map((t) => (
            <li key={t.label}>
              <label className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="text-xs text-muted">{t.hint}</span>
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled={t.required}
                  className="h-5 w-5 shrink-0 accent-[#25231F]"
                  aria-describedby={t.required ? "required-note" : undefined}
                />
              </label>
            </li>
          ))}
        </ul>
        <p id="required-note" className="mt-2 text-xs text-muted">
          Quotes, payments and security emails can&apos;t be turned off.
        </p>
        <ProtoNote>emails are sent with Resend from Phase 2.</ProtoNote>
      </Panel>
    </div>
  );
}
