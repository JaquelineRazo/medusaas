import { NotificationCenter } from "@/components/NotificationCenter";
import { requireStaff } from "@/lib/auth";
import { listNotices, markAllRead } from "@/lib/notifications";

export default async function AdminNotificationsPage() {
  const { supabase, user } = await requireStaff();
  // Shown as they were (unread highlighted), then marked read for the bell.
  const items = await listNotices(supabase, { limit: 100 });
  await markAllRead(supabase);
  return (
    <NotificationCenter
      items={items}
      email={user.email ?? ""}
      topics={[
        { label: "Payments", hint: "Deposits and payments confirmed by Stripe.", required: true },
        { label: "New requests", hint: "Every request a client opens." },
        { label: "Urgent tickets", hint: "Anything marked urgent or a site going down." },
        { label: "Calls", hint: "Bookings, changes and a daily agenda at 8:00." },
        { label: "Renewals", hint: "Domains, SSL and plans 30, 14 and 7 days ahead." },
      ]}
    />
  );
}
