import type { Metadata } from "next";
import { Shell, type NavItem } from "@/components/Shell";
import { leads, tickets } from "@/lib/mock";

export const metadata: Metadata = { title: "Admin Workspace · meduSAAS", robots: { index: false } };

const nav: NavItem[] = [
  { href: "/console", label: "Mission Control" },
  { href: "/console/inbox", label: "Inbox", count: leads.filter((l) => l.stage === "New").length },
  { href: "/console/tickets", label: "Service Desk", count: tickets.filter((t) => t.status === "evaluating").length },
  { href: "/console/clients", label: "Clients" },
  { href: "/console/assets", label: "Asset Monitor" },
  { href: "/console/revenue", label: "Revenue Center" },
  { href: "/console/crm", label: "Growth CRM" },
  { href: "/console/automations", label: "Automations" },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      nav={nav}
      root="/console"
      badge="Admin Workspace"
      user={{ initial: "J", name: "Jaqueline Razo", role: "Superadmin" }}
    >
      {children}
    </Shell>
  );
}
