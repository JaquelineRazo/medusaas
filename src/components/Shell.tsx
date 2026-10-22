"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Wordmark } from "./Jellyfish";
import { NotificationBell, type Notice } from "./NotificationBell";

export type NavItem = { href: string; label: string; count?: number };

function isActive(path: string, href: string, root: string) {
  const p = path.replace(/\/$/, "") || "/";
  return href === root ? p === root : p === href || p.startsWith(href + "/");
}

// Shared by the Client Portal (/app) and the Admin Workspace (/console).
// Same deep-sea family as the public pages, but static and calm: work happens here.
export function Shell({
  nav,
  root,
  badge,
  footer,
  user,
  notifications,
  children,
}: {
  nav: NavItem[];
  root: string;
  badge?: string;
  footer?: React.ReactNode;
  user: { initial: string; name: string; role: string };
  notifications: { items: Notice[]; email: string; href: string };
  children: React.ReactNode;
}) {
  const path = usePathname();
  const links = (mobile: boolean) =>
    nav.map((item) => {
      const active = isActive(path, item.href, root);
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={
            mobile
              ? `shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-cream font-semibold text-ink" : "text-cream/70"}`
              : `relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  active ? "bg-cream/10 font-semibold text-cream" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                }`
          }
        >
          {!mobile && active && (
            <span aria-hidden="true" className="absolute top-2 bottom-2 -left-5 w-1 rounded-r-full bg-sunshine" />
          )}
          {item.label}
          {!mobile && item.count ? (
            <span className="rounded-full bg-sunshine px-2 text-xs font-bold text-ink">{item.count}</span>
          ) : null}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen">
      <aside className="deep-flat sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto p-5 text-cream lg:flex">
        <Link href={root}>
          <Wordmark />
        </Link>
        {badge ? (
          <span className="mt-3 mb-6 self-start rounded-full border border-cream/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-soft-gold">
            {badge}
          </span>
        ) : (
          <div className="mb-8" />
        )}
        <nav className="flex flex-col gap-1">{links(false)}</nav>
        {footer && <div className="mt-auto pt-6">{footer}</div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shell-band text-cream lg:text-ink">
          <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <Link href={root} className="lg:hidden">
              <Wordmark size={28} />
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell {...notifications} />
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full bg-sunshine font-semibold text-ink"
              >
                {user.initial}
              </span>
              <span className="hidden text-sm leading-tight sm:block">
                <span className="block font-semibold">{user.name}</span>
                <span className="opacity-65">{user.role}</span>
              </span>
              <form action={signOut}>
                <button type="submit" className="ml-2 text-sm opacity-65 hover:opacity-100">
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Sections">
            {links(true)}
          </nav>
        </div>
        <main className="flex-1 px-4 pt-6 pb-12 sm:px-8 lg:pt-2">{children}</main>
      </div>
    </div>
  );
}
