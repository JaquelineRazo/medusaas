import Link from "next/link";
import { Mavi } from "@/components/Jellyfish";
import { Shell, type NavItem } from "@/components/Shell";
import { clientTickets, notifications, user } from "@/lib/mock";

const nav: NavItem[] = [
  { href: "/app", label: "Home" },
  { href: "/app/projects", label: "My projects" },
  {
    href: "/app/requests",
    label: "Requests",
    count: clientTickets.filter((t) => t.status !== "completed").length,
  },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/plan", label: "My plan" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/notifications", label: "Notifications", count: notifications.filter((n) => n.unread).length },
  { href: "/app/account", label: "My account" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      nav={nav}
      root="/app"
      user={{ initial: user.firstName[0], name: `${user.firstName} ${user.lastName}`, role: user.org }}
      footer={
        <Link href="/app/conversations/new" className="flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm">
          <Mavi size={36} />
          <span>
            <span className="block font-semibold">Need help?</span>
            <span className="text-muted">Chat with Mavi</span>
          </span>
        </Link>
      }
    >
      {children}
    </Shell>
  );
}
