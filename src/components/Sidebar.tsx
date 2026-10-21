"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mavi, Wordmark } from "./Jellyfish";

const nav = [
  { href: "/app", label: "Home" },
  { href: "/app/projects", label: "My projects" },
  { href: "/app/requests", label: "Requests", count: 2 },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/plan", label: "My plan" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/account", label: "My account" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface p-5 lg:flex">
      <Link href="/app" className="mb-8">
        <Wordmark />
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                active ? "bg-soft-gold font-semibold" : "text-muted hover:bg-cream"
              }`}
            >
              {item.label}
              {item.count ? (
                <span className="rounded-full bg-sunshine px-2 text-xs font-bold text-ink">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/app/conversations/new"
        className="mt-auto flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm"
      >
        <Mavi size={36} />
        <span>
          <span className="block font-semibold">Need help?</span>
          <span className="text-muted">Chat with Mavi</span>
        </span>
      </Link>
    </aside>
  );
}
