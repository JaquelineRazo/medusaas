"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Jellyfish";

export type NavItem = { href: string; label: string; count?: number };

function isActive(path: string, href: string, root: string) {
  const p = path.replace(/\/$/, "") || "/";
  return href === root ? p === root : p === href || p.startsWith(href + "/");
}

// Shared by the Client Portal (/app) and the Admin Workspace (/console).
export function Shell({
  nav,
  root,
  badge,
  footer,
  user,
  children,
}: {
  nav: NavItem[];
  root: string;
  badge?: string;
  footer?: React.ReactNode;
  user: { initial: string; name: string; role: string };
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
              ? `shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-soft-gold font-semibold" : "text-muted"}`
              : `flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  active ? "bg-soft-gold font-semibold" : "text-muted hover:bg-cream"
                }`
          }
        >
          {item.label}
          {!mobile && item.count ? (
            <span className="rounded-full bg-sunshine px-2 text-xs font-bold text-ink">{item.count}</span>
          ) : null}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface p-5 lg:flex">
        <Link href={root}>
          <Wordmark />
        </Link>
        {badge ? (
          <span className="mt-2 mb-6 self-start rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-cream">
            {badge}
          </span>
        ) : (
          <div className="mb-8" />
        )}
        <nav className="flex flex-col gap-1">{links(false)}</nav>
        {footer && <div className="mt-auto pt-6">{footer}</div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href={root} className="lg:hidden">
            <Wordmark size={28} />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink font-semibold text-cream"
            >
              {user.initial}
            </span>
            <span className="hidden text-sm leading-tight sm:block">
              <span className="block font-semibold">{user.name}</span>
              <span className="text-muted">{user.role}</span>
            </span>
            <Link href="/" className="ml-2 text-sm text-muted hover:text-ink">
              Sign out
            </Link>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Sections">
          {links(true)}
        </nav>
        <main className="flex-1 px-4 pb-12 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
