// Harness for module tests against local Supabase (`npx supabase start`).
// Every client is a real supabase-js client over PostgREST, so RLS and the database
// functions behave exactly as in production. Tests are skipped when the stack isn't up.
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { signJwt } from "./jwt";

export type Db = SupabaseClient<Database>;

export const LOCAL_URL = process.env.SUPABASE_TEST_URL ?? "http://127.0.0.1:54321";
const anonKey = signJwt({ role: "anon" });
const serviceKey = signJwt({ role: "service_role" });

async function probe() {
  try {
    const r = await fetch(`${LOCAL_URL}/rest/v1/`, { headers: { apikey: anonKey }, signal: AbortSignal.timeout(1500) });
    return r.status < 500;
  } catch {
    return false;
  }
}

/** True when local Supabase answers; use with `describe.skipIf(!localSupabase)`. */
export const localSupabase = await probe();

const options = { auth: { autoRefreshToken: false, persistSession: false } };

/** Bypasses RLS, like the app's admin client. For fixtures and assertions only. */
export const admin = (): Db => createClient<Database>(LOCAL_URL, serviceKey, options);

/** Acts as a signed-in user, so RLS applies. Staff need "aal2" to see client data. */
export function clientAs(userId: string, aal: "aal1" | "aal2" = "aal1"): Db {
  const token = signJwt({ sub: userId, role: "authenticated", aud: "authenticated", aal });
  return createClient<Database>(LOCAL_URL, anonKey, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
}

/**
 * Creates isolated fixtures and remembers them for `cleanup()`.
 * Deleting the organization cascades to projects, tickets, events and history;
 * deleting the auth user cascades to profile, memberships, staff and notifications.
 */
export function fixtures() {
  const db = admin();
  const users: string[] = [];
  const orgs: string[] = [];

  async function user(fullName = "Test person") {
    const { data, error } = await db.auth.admin.createUser({
      email: `${randomUUID()}@test.invalid`,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    users.push(data.user.id);
    return data.user.id;
  }

  async function org(name = "Test org", timezone = "America/Mexico_City") {
    const { data, error } = await db.from("organizations").insert({ name, timezone }).select("id").single();
    if (error) throw error;
    orgs.push(data.id);
    return data.id;
  }

  return {
    user,
    org,
    async client(orgId: string, role: "client_owner" | "client_member" = "client_owner") {
      const id = await user("Test client");
      const { error } = await db.from("memberships").insert({ organization_id: orgId, user_id: id, role });
      if (error) throw error;
      return id;
    },
    async staff() {
      const id = await user("Test staff");
      const { error } = await db.from("staff").insert({ user_id: id, role: "superadmin" });
      if (error) throw error;
      return id;
    },
    async project(orgId: string, name = "Test site") {
      const { data, error } = await db
        .from("projects")
        .insert({ organization_id: orgId, name, venture: "ORNIVA", kind: "website", hosting_owner: "client", code_owner: "client" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    async ticket(orgId: string, values: Partial<Database["public"]["Tables"]["tickets"]["Insert"]> = {}) {
      const { data, error } = await db
        .from("tickets")
        .insert({ organization_id: orgId, title: "Test ticket", ...values })
        .select("id, number")
        .single();
      if (error) throw error;
      return data;
    },
    async cleanup() {
      if (orgs.length) await db.from("organizations").delete().in("id", orgs.splice(0));
      for (const id of users.splice(0)) await db.auth.admin.deleteUser(id);
    },
  };
}
