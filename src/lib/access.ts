import type { SupabaseClient } from "@supabase/supabase-js";

// Access decision: the one place that says where a person may be. /app is the Client
// Portal, /console the Admin Workspace (staff only, always after the second factor).
// Used by the middleware (edge), the server guards and the sign-in actions, so this
// file must stay free of server-only and Node imports. RLS still guards every row.

export type Session = { signedIn: boolean; isStaff: boolean; aal: "aal1" | "aal2" | null };

const under = (path: string, root: string) => path === root || path.startsWith(`${root}/`) || path.startsWith(`${root}?`);

/** "allow", or where to send the person instead. `path` may include a query string. */
export function destinationFor(s: Session, path: string): "allow" | string {
  const app = under(path, "/app");
  const inConsole = under(path, "/console");
  if (!app && !inConsole) return "allow";

  if (!s.signedIn) return app ? `/sign-in?next=${encodeURIComponent(path)}` : "/sign-in";
  if (app) return s.isStaff ? "/console" : "allow";

  if (!s.isStaff) return "/app";
  if (under(path, "/console/mfa")) return "allow";
  return s.aal === "aal2" ? "allow" : "/console/mfa";
}

/** Only internal paths, so a `next` parameter can never become an open redirect. */
export function safeNext(next: string | null | undefined, fallback = "/app") {
  return next && /^\/(app|console)(\/|\?|$)/.test(next) ? next : fallback;
}

/** Where to land right after signing in or choosing a password. */
export function landingFor(s: Session, next: string | null | undefined) {
  let to = safeNext(next, s.isStaff ? "/console" : "/app");
  for (let hop = 0; hop < 3; hop++) {
    const d = destinationFor(s, to);
    if (d === "allow") return to;
    to = d;
  }
  return to;
}

/** Reads the facts the decision needs. The only place that asks "is this person staff?". */
export async function readSession(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, session: { signedIn: false, isStaff: false, aal: null } satisfies Session };
  const [{ data: isStaff }, { data: aal }] = await Promise.all([
    supabase.rpc("staff_pending_mfa"),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  const session: Session = { signedIn: true, isStaff: isStaff === true, aal: aal?.currentLevel === "aal2" ? "aal2" : "aal1" };
  return { user, session };
}
