import { NotificationCenter } from "@/components/NotificationCenter";
import { requireClient } from "@/lib/auth";
import { listNotices, markAllRead } from "@/lib/notifications";

export default async function NotificationsPage() {
  const { supabase, user, orgs } = await requireClient();
  // Shown as they were (unread highlighted), then marked read for the bell.
  const items = await listNotices(supabase, { tz: orgs[0]?.timezone, limit: 100 });
  await markAllRead(supabase);
  return (
    <NotificationCenter
      items={items}
      email={user.email ?? ""}
      topics={[
        { label: "Quotes and payments", hint: "A quote is ready, a payment is confirmed or due.", required: true },
        { label: "Request updates", hint: "Your requests move forward or need your input." },
        { label: "Calls and reminders", hint: "Invitations and a reminder the day before each call." },
        { label: "Project milestones", hint: "Milestones reached, deliveries ready for review." },
        { label: "Included support", hint: "Reminders 14, 7 and 1 days before it ends." },
      ]}
    />
  );
}
