import type { Metadata } from "next";
import { Shell, type NavItem } from "@/components/Shell";
import { requireStaff } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Workspace · meduSAAS", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, role } = await requireStaff();
  const [{ data: profile }, { count: toAssess }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", ["new", "evaluating"]),
    supabase.from("notifications").select("text, created_at, read_at").order("created_at", { ascending: false }).limit(20),
  ]);
  const name = profile?.full_name || user.email || "";

  const nav: NavItem[] = [
    { href: "/console", label: "Mission Control" },
    { href: "/console/tickets", label: "Service Desk", count: toAssess ?? 0 },
    { href: "/console/calendar", label: "Calendar" },
    { href: "/console/clients", label: "Clients" },
    { href: "/console/inbox", label: "Inbox · demo" },
    { href: "/console/assets", label: "Asset Monitor · demo" },
    { href: "/console/revenue", label: "Revenue · demo" },
    { href: "/console/crm", label: "Growth CRM · demo" },
    { href: "/console/automations", label: "Automations · demo" },
  ];

  return (
    <Shell
      nav={nav}
      root="/console"
      badge="Admin Workspace"
      user={{ initial: name[0]?.toUpperCase() ?? "?", name, role: role === "superadmin" ? "Superadmin" : "Operator" }}
      notifications={{
        items: (notes ?? []).map((n) => ({ text: n.text, when: fmtDateTime(n.created_at), unread: !n.read_at })),
        email: user.email ?? "",
        href: "/console/notifications",
      }}
    >
      {children}
    </Shell>
  );
}
