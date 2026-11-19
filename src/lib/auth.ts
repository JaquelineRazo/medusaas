import "server-only";
import { redirect } from "next/navigation";
import { destinationFor, readSession } from "./access";
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

/** The client's organizations (RLS returns only their own). */
export async function requireClient() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
  const { data: orgs } = await supabase.from("organizations").select("id, name, timezone").order("name");
  return { supabase, user, profile, orgs: orgs ?? [] };
}

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
