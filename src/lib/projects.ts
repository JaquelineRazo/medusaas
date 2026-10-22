import { daysUntil, fmtDay } from "./format";

export const kindLabel: Record<string, string> = {
  website: "Website",
  web_app: "Web app",
  mobile_app: "Mobile app",
  system: "System",
  data: "Data project",
};

/** Included-support status in client words (COPY.md). */
export function supportStatus(endsOn: string | null, tz?: string) {
  if (!endsOn) return { active: false, label: "No included support", days: null as number | null };
  const days = daysUntil(endsOn, tz);
  return days >= 0
    ? { active: true, label: `Included support until ${fmtDay(endsOn)}`, days }
    : { active: false, label: `Included support ended on ${fmtDay(endsOn)}`, days };
}

export const hostingLabel = (owner: string, provider: string | null) =>
  owner === "razzo" ? "Managed by our team" : `Managed by you${provider ? ` · ${provider}` : ""}`;
