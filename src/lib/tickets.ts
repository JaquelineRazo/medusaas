import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { notifyOrgMembers, notifyStaff } from "./notifications";
import { blockedReason, clientLabel, requestKinds, ticketCode, type Coverage, type RequestKind, type TicketStatus } from "./ticket-machine";

// Ticket lifecycle, server half: every ticket is opened and moved through here.
// `db` is the acting person's client, so RLS applies; the database re-checks every
// transition and the payment gate in public.transition_ticket().

type Db = SupabaseClient<Database>;
type Failure = { error: string };

/** A client opens a request from the conversation. The team is told. */
export async function openRequest(
  db: Db,
  client: { userId: string; orgs: { id: string; name: string }[] },
  input: { kind: RequestKind; projectId: string | null; details: string },
): Promise<{ id: string; code: string } | Failure> {
  const details = input.details.trim().slice(0, 4000);
  if (details.length < 5) return { error: "Tell us a little more so we can help." };
  if (!Object.hasOwn(requestKinds, input.kind)) return { error: "Choose what you need." };

  // The project must be one the client can see; its organization is the ticket's.
  let orgId = client.orgs[0]?.id;
  if (input.projectId) {
    const { data: p } = await db.from("projects").select("organization_id").eq("id", input.projectId).maybeSingle();
    if (!p) return { error: "We couldn't find that project." };
    orgId = p.organization_id;
  }
  if (!orgId) return { error: "Your account isn't linked to a company yet." };

  const firstLine = details.split("\n")[0].slice(0, 100);
  const { data: t, error } = await db
    .from("tickets")
    .insert({
      organization_id: orgId,
      project_id: input.projectId,
      title: `${requestKinds[input.kind]}: ${firstLine}`.slice(0, 140),
      description: details,
      priority: input.kind === "issue" ? "high" : "normal",
      created_by: client.userId,
    })
    .select("id, number")
    .single();
  if (error || !t) return { error: "We couldn't send it. Please try again." };

  const code = ticketCode(t.number);
  const org = client.orgs.find((o) => o.id === orgId)?.name ?? "A client";
  await notifyStaff(`New request ${code} from ${org}: ${firstLine}`, `/console/tickets/${t.id}`);
  return { id: t.id, code };
}

/** Staff move a ticket. The client's people are told. */
export async function moveTicket(
  db: Db,
  move: { ticketId: string; to: TicketStatus; note?: string | null; coverage?: Coverage | null },
): Promise<{ ok: true } | Failure> {
  const { data: t } = await db.from("tickets").select("status, coverage, number, organization_id").eq("id", move.ticketId).maybeSingle();
  if (!t) return { error: "Ticket not found." };
  const reason = blockedReason(t.status, move.to, move.coverage ?? t.coverage);
  if (reason) return { error: reason };

  const { error } = await db.rpc("transition_ticket", {
    p_ticket: move.ticketId,
    p_to: move.to,
    p_note: move.note ?? undefined,
    p_coverage: move.coverage ?? undefined,
  });
  if (error) return { error: error.message };

  await notifyOrgMembers(db, t.organization_id, `${ticketCode(t.number)} is now: ${clientLabel[move.to]}.`, `/app/requests/${move.ticketId}`);
  return { ok: true };
}
