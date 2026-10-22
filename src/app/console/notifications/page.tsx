import { NotificationCenter } from "@/components/NotificationCenter";
import { adminNotifications } from "@/lib/mock";

export default function AdminNotificationsPage() {
  return (
    <NotificationCenter
      items={adminNotifications}
      email="jaqueline@razzobusiness.com"
      topics={[
        { label: "Payments", hint: "Deposits and payments confirmed by Stripe.", required: true },
        { label: "New leads", hint: "Requests from Mavi, forms and referrals." },
        { label: "Urgent tickets", hint: "Anything marked urgent or a site going down." },
        { label: "Calls", hint: "Bookings, changes and a daily agenda at 8:00." },
        { label: "Renewals", hint: "Domains, SSL and plans 30, 14 and 7 days ahead." },
      ]}
    />
  );
}
