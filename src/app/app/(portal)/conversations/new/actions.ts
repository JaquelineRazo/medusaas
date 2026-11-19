"use server";

import { requireClient } from "@/lib/auth";
import { notifyStaff } from "@/lib/notifications";
import { ticketCode } from "@/lib/ticket-machine";

const kinds = { issue: "Issue", change: "Change", new: "New", question: "Question" } as const;
export type Kind = keyof typeof kinds;

export async function createRequest(input: { kind: Kind; projectId: string | null; details: string }) {
  const { supabase, user, orgs } = await requireClient();
  const details = input.details.trim().slice(0, 4000);
  if (details.length < 5) return { error: "Tell us a little more so we can help." };
  if (!(input.kind in kinds)) return { error: "Choose what you need." };

  // The project must be one the client can see; its organization is the ticket's.
  let orgId = orgs[0]?.id;
  if (input.projectId) {
    const { data: p } = await supabase.from("projects").select("organization_id").eq("id", input.projectId).maybeSingle();
    if (!p) return { error: "We couldn't find that project." };
    orgId = p.organization_id;
  }
  if (!orgId) return { error: "Your account isn't linked to a company yet." };

  const firstLine = details.split("\n")[0].slice(0, 100);
  const { data: t, error } = await supabase
    .from("tickets")
    .insert({
      organization_id: orgId,
      project_id: input.projectId,
      title: `${kinds[input.kind]}: ${firstLine}`.slice(0, 140),
      description: details,
      priority: input.kind === "issue" ? "high" : "normal",
      created_by: user.id,
    })
    .select("id, number")
    .single();
  if (error || !t) return { error: "We couldn't send it. Please try again." };

  const org = orgs.find((o) => o.id === orgId)?.name ?? "A client";
  await notifyStaff(`New request ${ticketCode(t.number)} from ${org}: ${firstLine}`, `/console/tickets/${t.id}`);
  return { id: t.id, code: ticketCode(t.number) };
}
