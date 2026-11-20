import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { destinationFor, readSession } from "./access";
import type { Database } from "./database.types";
import { DEFAULT_TZ } from "./format";
import { createClient } from "./supabase/server";

// Server-side guards. The middleware already routes people, but every page and server
// action checks again here: never trust the route alone.

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return { supabase, user };
}

export async function requireStaff() {
  const supabase = await createClient();
  const { user, session } = await readSession(supabase);
  const to = destinationFor(session, "/console");
  if (!user || to !== "allow") redirect(to === "allow" ? "/sign-in" : to);
  const { data: staff } = await supabase.from("staff").select("role").eq("user_id", user.id).single();
  return { supabase, user, role: staff?.role ?? "operator" };
}

/**
 * Client context: the person's organizations (RLS returns only their own, by name), their
 * primary organization (the oldest membership) and the time zone every portal page uses.
 */
export async function clientContext(db: SupabaseClient<Database>, userId: string) {
  const [{ data: profile }, { data: orgs }, { data: first }] = await Promise.all([
    db.from("profiles").select("full_name, email").eq("id", userId).single(),
    db.from("organizations").select("id, name, timezone").order("name"),
    db.from("memberships").select("organization_id").eq("user_id", userId).order("created_at").limit(1).maybeSingle(),
  ]);
  const list = orgs ?? [];
  const primaryOrg = list.find((o) => o.id === first?.organization_id) ?? null;
  return { profile, orgs: list, primaryOrg, tz: primaryOrg?.timezone ?? DEFAULT_TZ };
}

export async function requireClient() {
  const { supabase, user } = await requireUser();
  return { supabase, user, ...(await clientContext(supabase, user.id)) };
}

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
