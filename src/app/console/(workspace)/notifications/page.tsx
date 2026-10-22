import { NotificationCenter } from "@/components/NotificationCenter";
import { requireStaff } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";

export default async function AdminNotificationsPage() {
  const { supabase, user } = await requireStaff();
  const { data } = await supabase.from("notifications").select("text, created_at, read_at").order("created_at", { ascending: false }).limit(100);
  return (
    <NotificationCenter
      items={(data ?? []).map((n) => ({ text: n.text, when: fmtDateTime(n.created_at), unread: !n.read_at }))}
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
