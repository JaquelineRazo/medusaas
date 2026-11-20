// Choosing a password from a reset link, for people with and without a second factor.
// Uses real sessions (password sign-in, TOTP enrollment, recovery link) on local Supabase.
import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";
import { choosePassword, needsCodeToChoosePassword } from "@/lib/passwords";
import { signJwt } from "./support/jwt";
import { admin, fixtures, LOCAL_URL, localSupabase } from "./support/local-supabase";

const fresh = () => createClient(LOCAL_URL, signJwt({ role: "anon" }), { auth: { autoRefreshToken: false, persistSession: false } });

const window30 = () => Math.floor(Date.now() / 30000);
function totp(secret: string, step = window30()) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.replace(/=+$/, "")) bits += alpha.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, "0");
}

describe.skipIf(!localSupabase)("choosing a password from a reset link", () => {
  const fx = fixtures();
  afterEach(() => fx.cleanup());

  async function person({ mfa }: { mfa: boolean }) {
    const email = `${randomUUID()}@test.invalid`;
    const password = "first-password-123";
    const id = await fx.user();
    await admin().auth.admin.updateUserById(id, { email, password, email_confirm: true });
    let secret = "";
    let enrolledIn = -1;
    if (mfa) {
      const db = fresh();
      await db.auth.signInWithPassword({ email, password });
      const { data: f } = await db.auth.mfa.enroll({ factorType: "totp", friendlyName: "test" });
      secret = f!.totp.secret;
      enrolledIn = window30();
      const { error } = await db.auth.mfa.challengeAndVerify({ factorId: f!.id, code: totp(secret) });
      if (error) throw error;
    }
    // What /auth/confirm does with the emailed link: an aal1 session.
    const { data: link } = await admin().auth.admin.generateLink({ type: "recovery", email });
    const db = fresh();
    const { error } = await db.auth.verifyOtp({ type: "recovery", token_hash: link.properties!.hashed_token });
    if (error) throw error;
    // A code already used at enrollment can't be reused: wait for the next one.
    const nextCode = async () => {
      while (window30() === enrolledIn) await new Promise((r) => setTimeout(r, 500));
      return totp(secret);
    };
    return { email, db, nextCode };
  }

  const canSignIn = async (email: string, password: string) => !(await fresh().auth.signInWithPassword({ email, password })).error;

  it("without a second factor, the new password is saved straight away", async () => {
    const { email, db } = await person({ mfa: false });
    expect(await needsCodeToChoosePassword(db)).toBe(false);
    expect(await choosePassword(db, { password: "second-password-123", confirm: "second-password-123" })).toEqual({ ok: true });
    expect(await canSignIn(email, "second-password-123")).toBe(true);
  });

  it("with a second factor, it asks for the code, refuses a wrong one and saves after a right one", async () => {
    const { email, db, nextCode } = await person({ mfa: true });
    const input = { password: "second-password-123", confirm: "second-password-123" };

    expect(await needsCodeToChoosePassword(db)).toBe(true);
    expect(await choosePassword(db, input)).toEqual({ error: "Open your authenticator app and type the 6-digit code for meduSAAS." });
    expect(await choosePassword(db, { ...input, code: "000000" })).toEqual({ error: "That code didn't work. Wait for a new one and try again." });
    expect(await canSignIn(email, "second-password-123")).toBe(false);

    expect(await choosePassword(db, { ...input, code: await nextCode() })).toEqual({ ok: true });
    expect(await canSignIn(email, "second-password-123")).toBe(true);
    expect(await canSignIn(email, "first-password-123")).toBe(false);
  }, 45_000);

  it("checks the passwords before anything else", async () => {
    const { db } = await person({ mfa: false });
    expect(await choosePassword(db, { password: "short", confirm: "short" })).toEqual({ error: "Use at least 10 characters." });
    expect(await choosePassword(db, { password: "second-password-123", confirm: "different-123456" })).toEqual({
      error: "The two passwords don't match.",
    });
  });
});
