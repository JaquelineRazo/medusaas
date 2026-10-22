"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, siteUrl } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";
import { blockedReason, clientLabel, ticketCode, type Coverage, type TicketStatus } from "@/lib/ticket-machine";

type State = { error?: string; ok?: boolean; link?: string; email?: string } | undefined;
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const opt = (f: FormData, k: string, max = 200) => str(f, k, max) || null;

/**
 * Creates (or finds) the auth user and returns a one-time link to choose a password.
 * The link goes straight to our /auth/confirm, so it works whether we email it or the
 * founder sends it herself. Nothing is emailed from here.
 */
async function invitationLink(email: string, fullName: string | null) {
  const admin = createAdminClient();
  const redirectTo = `${siteUrl()}/set-password`;
  let res = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo, data: { full_name: fullName } } });
  let type: "invite" | "recovery" = "invite";
  if (res.error) {
    // Already has an account: send a set-password link instead.
    res = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
    type = "recovery";
  }
  if (res.error || !res.data.user) throw new Error(res.error?.message ?? "Couldn't create the invitation");
  if (fullName) await admin.from("profiles").update({ full_name: fullName }).eq("id", res.data.user.id);
  const link = `${siteUrl()}/auth/confirm?token_hash=${res.data.properties.hashed_token}&type=${type}&next=/set-password`;
  return { userId: res.data.user.id, link };
}

function projectFields(f: FormData) {
  return {
    name: str(f, "project_name", 120),
    venture: str(f, "venture") as Database["public"]["Enums"]["venture"],
    kind: str(f, "kind"),
    url: opt(f, "url"),
    stack: opt(f, "stack", 120),
    hosting_owner: str(f, "hosting_owner"),
    hosting_provider: opt(f, "hosting_provider", 120),
    code_owner: str(f, "code_owner"),
    support_ends_on: opt(f, "support_ends_on", 10),
  };
}

export async function createClientAccount(_: State, f: FormData): Promise<State> {
  const { supabase } = await requireStaff();
  const email = str(f, "email").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Check the email address." };

  const { data: org, error: e1 } = await supabase
    .from("organizations")
    .insert({ name: str(f, "org_name", 120), industry: opt(f, "industry"), city: opt(f, "city"), timezone: str(f, "timezone") || "America/Mexico_City" })
    .select("id")
    .single();
  if (e1 || !org) return { error: `Couldn't create the client: ${e1?.message}` };

  const { error: e2 } = await supabase.from("projects").insert({ organization_id: org.id, ...projectFields(f) });
  if (e2) return { error: `Client created, but the project failed: ${e2.message}` };

  try {
    const { userId, link } = await invitationLink(email, opt(f, "full_name", 120));
    const { error: e3 } = await supabase.from("memberships").insert({ organization_id: org.id, user_id: userId, role: "client_owner" });
    if (e3) return { error: `Invitation created, but linking failed: ${e3.message}` };
    revalidatePath("/console/clients");
    return { ok: true, link, email };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function inviteMember(_: State, f: FormData): Promise<State> {
  const { supabase } = await requireStaff();
  const orgId = str(f, "organization_id");
  const email = str(f, "email").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Check the email address." };
  try {
    const { userId, link } = await invitationLink(email, opt(f, "full_name", 120));
    const { error } = await supabase
      .from("memberships")
      .upsert({ organization_id: orgId, user_id: userId, role: str(f, "role") === "client_member" ? "client_member" : "client_owner" });
    if (error) return { error: error.message };
    revalidatePath(`/console/clients/${orgId}`);
    return { ok: true, link, email };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function addProject(_: State, f: FormData): Promise<State> {
  const { supabase } = await requireStaff();
  const orgId = str(f, "organization_id");
  const { error } = await supabase.from("projects").insert({ organization_id: orgId, ...projectFields(f) });
  if (error) return { error: error.message };
  revalidatePath(`/console/clients/${orgId}`);
  return { ok: true };
}

export async function addEvent(_: State, f: FormData): Promise<State> {
  const { supabase } = await requireStaff();
  const orgId = str(f, "organization_id");
  const date = str(f, "date", 10);
  const time = str(f, "time", 5);
  const tz = str(f, "timezone") || "America/Mexico_City";
  if (!orgId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose a client and a date." };
  // Wall-clock time in the client's zone → UTC instant.
  const { data: startsAt, error: tzErr } = await supabase.rpc("local_to_utc", { p_local: `${date} ${time || "12:00"}`, p_tz: tz });
  if (tzErr || !startsAt) return { error: "Couldn't read that date and time." };
  const { error } = await supabase.from("calendar_events").insert({
    organization_id: orgId,
    project_id: opt(f, "project_id"),
    type: str(f, "type") as Database["public"]["Enums"]["event_type"],
    title: str(f, "title", 140),
    starts_at: startsAt,
    all_day: !time,
    minutes: time ? Number(str(f, "minutes")) || 30 : null,
    location: opt(f, "location"),
    staff_only: f.get("staff_only") === "on",
  });
  if (error) return { error: error.message };
  revalidatePath("/console/calendar");
  revalidatePath(`/console/clients/${orgId}`);
  return { ok: true };
}

export async function moveTicket(_: State, f: FormData): Promise<State> {
  const { supabase } = await requireStaff();
  const id = str(f, "ticket_id");
  const to = str(f, "to") as TicketStatus;
  const coverage = (str(f, "coverage") || null) as Coverage | null;
  const { data: t } = await supabase.from("tickets").select("status, coverage, number, organization_id").eq("id", id).single();
  if (!t) return { error: "Ticket not found." };
  const reason = blockedReason(t.status, to, coverage ?? t.coverage);
  if (reason) return { error: reason };

  const { error } = await supabase.rpc("transition_ticket", { p_ticket: id, p_to: to, p_note: opt(f, "note", 2000) ?? undefined, p_coverage: coverage ?? undefined });
  if (error) return { error: error.message };

  // Tell the client's people (staff may write notifications).
  const { data: members } = await supabase.from("memberships").select("user_id").eq("organization_id", t.organization_id);
  if (members?.length)
    await supabase.from("notifications").insert(
      members.map((m) => ({ user_id: m.user_id, text: `${ticketCode(t.number)} is now: ${clientLabel[to]}.`, link: `/app/requests/${id}` })),
    );
  revalidatePath(`/console/tickets/${id}`);
  return { ok: true };
}
