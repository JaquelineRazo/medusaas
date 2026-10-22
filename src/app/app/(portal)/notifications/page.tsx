import { NotificationCenter } from "@/components/NotificationCenter";
import { requireClient } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";

export default async function NotificationsPage() {
  const { supabase, user, orgs } = await requireClient();
  const { data } = await supabase.from("notifications").select("text, created_at, read_at").order("created_at", { ascending: false }).limit(100);
  return (
    <NotificationCenter
      items={(data ?? []).map((n) => ({ text: n.text, when: fmtDateTime(n.created_at, orgs[0]?.timezone), unread: !n.read_at }))}
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
