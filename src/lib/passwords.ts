import type { SupabaseClient } from "@supabase/supabase-js";

// Choosing a password from an invitation or reset link. The link opens a session at
// aal1; Supabase refuses a password change for anyone with a verified second factor
// until that session reaches aal2, so we verify their 6-digit code first.

const CODE_HINT = "Open your authenticator app and type the 6-digit code for meduSAAS.";

/** Whether this session must pass the second factor before changing the password. */
export async function needsCodeToChoosePassword(db: SupabaseClient) {
  const { data } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
}

export async function choosePassword(
  db: SupabaseClient,
  input: { password: string; confirm: string; code?: string | null },
): Promise<{ ok: true } | { error: string }> {
  if (input.password.length < 10) return { error: "Use at least 10 characters." };
  if (input.password !== input.confirm) return { error: "The two passwords don't match." };
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Your link expired. Ask us for a new invitation or reset your password." };

  if (await needsCodeToChoosePassword(db)) {
    const code = (input.code ?? "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) return { error: CODE_HINT };
    const { data: factors } = await db.auth.mfa.listFactors();
    const factor = factors?.totp.find((f) => f.status === "verified");
    if (!factor) return { error: CODE_HINT };
    const { error } = await db.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (error) return { error: "That code didn't work. Wait for a new one and try again." };
  }

  const { error } = await db.auth.updateUser({ password: input.password });
  if (error) return { error: error.message };
  return { ok: true };
}
