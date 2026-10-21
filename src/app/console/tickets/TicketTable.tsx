"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Pill } from "@/components/ui";
import { tickets, type Priority } from "@/lib/mock";

const filters = ["All", "Needs assessment", "Waiting on client", "In progress", "Done"] as const;
type Filter = (typeof filters)[number];

const match: Record<Filter, (s: string) => boolean> = {
  All: () => true,
  "Needs assessment": (s) => s === "evaluating" || s === "needs_clarification",
  "Waiting on client": (s) => s === "quote_ready" || s === "awaiting_payment" || s === "client_review",
  "In progress": (s) => s === "in_progress",
  Done: (s) => s === "completed",
};

const priorityTone: Record<Priority, "danger" | "warning" | "neutral"> = {
  Urgent: "danger",
  High: "warning",
  Normal: "neutral",
  Low: "neutral",
};

export function TicketTable() {
  const [filter, setFilter] = useState<Filter>("All");
  const rows = tickets.filter((t) => match[filter](t.status));
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={f === filter}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              f === filter ? "bg-ink font-semibold text-cream" : "border border-line bg-surface hover:bg-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              {["Ticket", "Client · project", "Category", "Priority", "Coverage", "Channel", "Hours", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-cream/60">
                <td className="px-4 py-3">
                  <Link href={`/console/tickets/${t.id}`} className="font-medium hover:text-honey">
                    <span className="block text-xs text-muted">{t.id} · {t.opened}</span>
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="block">{t.client}</span>
                  <span className="text-xs text-muted">{t.project} · {t.venture}</span>
                </td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3"><Pill tone={priorityTone[t.priority]}>{t.priority}</Pill></td>
                <td className="px-4 py-3"><Pill tone={t.coverage === "To assess" ? "warning" : "neutral"}>{t.coverage}</Pill></td>
                <td className="px-4 py-3 text-muted">{t.channel}</td>
                <td className="px-4 py-3">{t.hoursLogged}h</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
