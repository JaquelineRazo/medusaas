import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for invitation and password-reset emails (token_hash flow).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = params.get("next") === "/set-password" ? "/set-password" : "/app";
  const url = request.nextUrl.clone();
  url.search = "";

  const code = params.get("code");
  if ((tokenHash && type) || code) {
    const supabase = await createClient();
    // token_hash: our invitation links and custom templates. code: Supabase's default email (PKCE).
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });
    if (!error) {
      url.pathname = next;
      return NextResponse.redirect(url);
    }
  }
  url.pathname = "/sign-in";
  url.searchParams.set("link", "expired");
  return NextResponse.redirect(url);
}
