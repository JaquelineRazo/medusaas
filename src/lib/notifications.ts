import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { fmtDateTime } from "./format";
import { createAdminClient } from "./supabase/admin";

// Notices: what the bell and the notifications page show. Every read and write of
// public.notifications goes through here. RLS keeps each person to their own notices,
// and only staff may write them, so clients reach staff through notifyStaff().

type Db = SupabaseClient<Database>;

export type Notice = { id: string; text: string; when: string; unread: boolean; link: string | null };

const MAX_TEXT = 300; // notifications.text check constraint

/** The viewer's newest notices, with times in `tz`. */
export async function listNotices(db: Db, { tz, limit = 20 }: { tz?: string; limit?: number }): Promise<Notice[]> {
  const { data } = await db
    .from("notifications")
    .select("id, text, link, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((n) => ({ id: n.id, text: n.text, link: n.link, when: fmtDateTime(n.created_at, tz), unread: !n.read_at }));
}

/** Marks every unread notice of the viewer as read. */
export async function markAllRead(db: Db) {
  await db.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
}

/** Tells every member of an organization. `db` must act as staff (only staff may notify). */
export async function notifyOrgMembers(db: Db, orgId: string, text: string, link: string) {
  const { data: members } = await db.from("memberships").select("user_id").eq("organization_id", orgId);
  await send(db, (members ?? []).map((m) => m.user_id), text, link);
}

/** Tells the whole team. Safe to call on behalf of a client: it uses the admin client. */
export async function notifyStaff(text: string, link: string) {
  const db = createAdminClient();
  const { data: staff } = await db.from("staff").select("user_id");
  await send(db, (staff ?? []).map((s) => s.user_id), text, link);
}

// Best effort: a notice that fails to send must never undo the action that caused it.
async function send(db: Db, userIds: string[], text: string, link: string) {
  if (!userIds.length) return;
  const { error } = await db
    .from("notifications")
    .insert(userIds.map((user_id) => ({ user_id, text: text.slice(0, MAX_TEXT), link })));
  if (error) console.error("notifications: couldn't send", error.message);
}
