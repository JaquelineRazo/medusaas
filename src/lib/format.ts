// Dates are stored as timestamptz/date and shown in the organization's time zone.

export const DEFAULT_TZ = "America/Mexico_City";

export function fmtDate(value: string | Date, tz = DEFAULT_TZ, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Date(value).toLocaleDateString("en-US", { timeZone: tz, ...opts });
}

export function fmtDateTime(value: string | Date, tz = DEFAULT_TZ) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/** A plain `date` column (YYYY-MM-DD) without shifting it across time zones. */
export function fmtDay(day: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}

/** Today as YYYY-MM-DD in a time zone. */
export function todayIn(tz = DEFAULT_TZ) {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export function daysUntil(day: string, tz = DEFAULT_TZ) {
  const ms = Date.parse(`${day}T00:00:00Z`) - Date.parse(`${todayIn(tz)}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export const tzLabel = (tz: string) =>
  ({ "America/Mexico_City": "CDMX", "America/Los_Angeles": "LA time", "America/New_York": "NY time" })[tz] ?? tz;
