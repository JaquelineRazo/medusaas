"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Notice = { text: string; when: string; unread: boolean };

// Bell next to the user name. Every notice here is also sent to `email`.
export function NotificationBell({ items, email, href }: { items: Notice[]; email: string; href: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-current/15 transition hover:bg-current/5"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4a2 2 0 0 0 4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sunshine px-1 text-[11px] font-bold text-ink">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-surface text-ink shadow-[0_24px_60px_-24px_rgba(37,35,31,0.35)]">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <p className="font-semibold">Notifications</p>
            {unread > 0 && <span className="text-xs text-muted">{unread} new</span>}
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {items.map((n) => (
              <li key={n.text} className="flex gap-3 px-5 py-3">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-sunshine" : "bg-transparent"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${n.unread ? "font-medium" : "text-muted"}`}>{n.text}</span>
                  <span className="text-xs text-muted">{n.when}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-cream px-5 py-3 text-xs">
            <span className="min-w-0 truncate text-muted">
              Also sent to <span className="font-medium text-ink">{email}</span>
            </span>
            <Link href={href} onClick={() => setOpen(false)} className="shrink-0 font-semibold text-honey">
              Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
