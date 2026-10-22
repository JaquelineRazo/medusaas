import Link from "next/link";
import { Mavi } from "@/components/Jellyfish";
import { Shell, type NavItem } from "@/components/Shell";
import { requireClient } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile, orgs } = await requireClient();
  const [{ count: open }, { data: notes }] = await Promise.all([
    supabase.from("tickets").select("id", { count: "exact", head: true }).not("status", "in", "(completed,cancelled)"),
    supabase.from("notifications").select("text, created_at, read_at").order("created_at", { ascending: false }).limit(20),
  ]);
  const name = profile?.full_name || user.email || "";
  const tz = orgs[0]?.timezone;

  const nav: NavItem[] = [
    { href: "/app", label: "Home" },
    { href: "/app/projects", label: "My projects" },
    { href: "/app/calendar", label: "Calendar" },
    { href: "/app/requests", label: "Requests", count: open ?? 0 },
    { href: "/app/billing", label: "Billing" },
    { href: "/app/plan", label: "My plan" },
    { href: "/app/documents", label: "Documents" },
    { href: "/app/account", label: "My account" },
  ];

  return (
    <Shell
      nav={nav}
      root="/app"
      user={{ initial: name[0]?.toUpperCase() ?? "?", name, role: orgs.map((o) => o.name).join(", ") }}
      notifications={{
        items: (notes ?? []).map((n) => ({ text: n.text, when: fmtDateTime(n.created_at, tz), unread: !n.read_at })),
        email: user.email ?? "",
        href: "/app/notifications",
      }}
      footer={
        <Link href="/app/conversations/new" className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-cream/5 p-4 text-sm hover:bg-cream/10">
          <Mavi size={36} />
          <span>
            <span className="block font-semibold">Need help?</span>
            <span className="text-cream/65">Chat with Mavi</span>
          </span>
        </Link>
      }
    >
      {orgs.length === 0 ? (
        <div className="mx-auto max-w-xl py-16 text-center">
          <h1 className="text-2xl font-bold">Your account is almost ready</h1>
          <p className="mt-2 text-muted">
            It isn&apos;t linked to your company yet. We&apos;ll let you know by email as soon as it is.
          </p>
        </div>
      ) : (
        children
      )}
    </Shell>
  );
}
