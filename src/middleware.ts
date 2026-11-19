import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { destinationFor, readSession } from "@/lib/access";

// Refreshes the session on every request and guards the two private areas:
// /app (clients) and /console (staff, always with MFA). MED-006. The rule itself
// lives in destinationFor(); this only reads the session and obeys.
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

  const { session } = await readSession(supabase);
  const to = destinationFor(session, request.nextUrl.pathname + request.nextUrl.search);
  if (to === "allow") return response;

  const redirect = NextResponse.redirect(new URL(to, request.url));
  for (const c of response.cookies.getAll()) redirect.cookies.set(c);
  return redirect;
}

export const config = {
  matcher: ["/app/:path*", "/console/:path*", "/app", "/console"],
};
