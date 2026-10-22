"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { eventTypeLabel, today, type CalEvent, type EventType } from "@/lib/mock";

// Dots only, never text colour (BRAND.md). Labels always travel with them.
const dot: Record<EventType, string> = {
  call: "bg-sunshine",
  milestone: "bg-ink",
  delivery: "bg-success",
  payment: "bg-honey",
  coverage: "bg-[#D9822B]",
  renewal: "bg-muted",
};

const filters: { label: string; types: EventType[] | null }[] = [
  { label: "All", types: null },
  { label: "Calls", types: ["call"] },
  { label: "Milestones & deliveries", types: ["milestone", "delivery"] },
  { label: "Payments", types: ["payment"] },
  { label: "Support & renewals", types: ["coverage", "renewal"] },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function longDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function timeRange(e: CalEvent) {
  if (!e.time) return "All day";
  const [h, min] = e.time.split(":").map(Number);
  const end = h * 60 + min + (e.minutes ?? 30);
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  return `${fmt(h * 60 + min)}–${fmt(end)} CDMX`;
}

// A small .ics so a call lands in the person's own calendar (Google, Outlook, Apple).
function downloadIcs(e: CalEvent) {
  const stamp = (date: string, time: string, add = 0) => {
    const [h, m] = time.split(":").map(Number);
    const t = h * 60 + m + add;
    return `${date.replaceAll("-", "")}T${String(Math.floor(t / 60)).padStart(2, "0")}${String(t % 60).padStart(2, "0")}00`;
  };
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//meduSAAS//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@medusaas`,
    `DTSTART;TZID=America/Mexico_City:${stamp(e.date, e.time!)}`,
    `DTEND;TZID=America/Mexico_City:${stamp(e.date, e.time!, e.minutes ?? 30)}`,
    `SUMMARY:${e.title} · meduSAAS`,
    `LOCATION:${e.where ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${e.title.replace(/\W+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Calendar({ events, mode }: { events: CalEvent[]; mode: "client" | "admin" }) {
  const [month, setMonth] = useState({ y: 2026, m: 9 });
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const shown = useMemo(() => {
    const types = filters[filter].types;
    return events.filter((e) => !types || types.includes(e.type)).sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  }, [events, filter]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of shown) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
  }, [shown]);

  const first = new Date(month.y, month.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => {
    const d = i - lead + 1;
    return d >= 1 && d <= days ? d : null;
  });
  const title = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const step = (n: number) => {
    setSelected(null);
    setMonth(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));
  };

  const agenda = selected ? byDay.get(selected) ?? [] : shown.filter((e) => e.date >= today).slice(0, 8);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter events">
        {filters.map((f, i) => (
          <button
            key={f.label}
            type="button"
            aria-pressed={filter === i}
            onClick={() => setFilter(i)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === i ? "bg-ink text-cream" : "border border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6" aria-label={title}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => step(-1)} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-cream">
                ←
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-cream">
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const date = iso(month.y, month.m, d);
              const list = byDay.get(date) ?? [];
              const isToday = date === today;
              const isSel = date === selected;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(isSel ? null : date)}
                  aria-pressed={isSel}
                  aria-label={`${longDate(date)}${list.length ? `, ${list.length} event${list.length > 1 ? "s" : ""}` : ""}`}
                  className={`flex min-h-14 flex-col items-stretch gap-1 rounded-xl p-1.5 text-left transition sm:min-h-24 ${
                    isSel ? "bg-soft-gold" : "hover:bg-cream"
                  } ${date < today ? "opacity-55" : ""}`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center self-start rounded-full text-xs font-semibold ${
                      isToday ? "bg-ink text-cream" : ""
                    }`}
                  >
                    {d}
                  </span>
                  {/* Small screens: dots. Larger: short labels. */}
                  <span className="flex flex-wrap gap-1 sm:hidden">
                    {list.map((e) => (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${dot[e.type]}`} />
                    ))}
                  </span>
                  <span className="hidden flex-col gap-1 sm:flex">
                    {list.slice(0, 2).map((e) => (
                      <span key={e.id} className="flex items-center gap-1 truncate rounded-md bg-cream px-1.5 py-0.5 text-[11px] leading-tight">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[e.type]}`} />
                        <span className="truncate">{e.time ? `${e.time} ` : ""}{mode === "admin" ? e.client : e.title}</span>
                      </span>
                    ))}
                    {list.length > 2 && <span className="px-1.5 text-[11px] text-muted">+{list.length - 2} more</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {(Object.keys(eventTypeLabel) as EventType[])
              .filter((t) => mode === "admin" || t !== "renewal")
              .map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${dot[t]}`} />
                  {eventTypeLabel[t]}
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6" aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{selected ? longDate(selected) : "Coming up"}</h2>
            {selected && (
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-medium text-honey">
                Show upcoming
              </button>
            )}
          </div>
          {agenda.length === 0 ? (
            <p className="text-sm text-muted">Nothing scheduled{selected ? " this day" : ""}.</p>
          ) : (
            <ul className="space-y-3">
              {agenda.map((e) => (
                <li key={e.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot[e.type]}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">
                        {eventTypeLabel[e.type]} · {longDate(e.date)} · {timeRange(e)}
                      </p>
                      <p className="mt-0.5 font-semibold">{e.title}</p>
                      <p className="text-sm text-muted">
                        {mode === "admin" ? (
                          <Link href={`/console/clients/${e.clientId}`} className="hover:text-ink">
                            {e.client}
                          </Link>
                        ) : null}
                        {mode === "admin" && e.project ? " · " : ""}
                        {e.project}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {e.type === "call" && e.date >= today && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadIcs(e)}
                              className="rounded-full bg-sunshine px-3.5 py-1.5 text-xs font-semibold text-ink hover:brightness-95"
                            >
                              Add to my calendar
                            </button>
                            <span className="self-center text-xs text-muted">{e.where} link arrives by email</span>
                          </>
                        )}
                        {e.href && mode === "client" && (
                          <Link href={e.href} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium hover:bg-cream">
                            Open
                          </Link>
                        )}
                        {mode === "admin" && e.type === "call" && (
                          <span className="text-xs text-muted">Visible to the client</span>
                        )}
                        {e.staffOnly && <span className="text-xs text-muted">Only visible to staff</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
