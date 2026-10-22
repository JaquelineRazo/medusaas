import { NotificationCenter } from "@/components/NotificationCenter";
import { notifications, user } from "@/lib/mock";

export default function NotificationsPage() {
  return (
    <NotificationCenter
      items={notifications}
      email={user.email}
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
