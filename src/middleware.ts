import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the session on every request and guards the two private areas:
// /app (clients) and /console (staff, always with MFA). MED-006.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isApp = path === "/app" || path.startsWith("/app/");
  const isConsole = path === "/console" || path.startsWith("/console/");
  if (!isApp && !isConsole) return response;

  const go = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    if (to === "/sign-in" && isApp) url.searchParams.set("next", path + request.nextUrl.search);
    const redirect = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  };

  if (!user) return go("/sign-in");

  const { data: isStaff } = await supabase.rpc("staff_pending_mfa");
  if (isApp) return isStaff ? go("/console") : response;

  // /console: staff only, and only after the second factor.
  if (!isStaff) return go("/app");
  if (path.startsWith("/console/mfa")) return response;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.currentLevel === "aal2" ? response : go("/console/mfa");
}

export const config = {
  matcher: ["/app/:path*", "/console/:path*", "/app", "/console"],
};
