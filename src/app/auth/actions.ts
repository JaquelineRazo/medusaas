"use server";

import { redirect } from "next/navigation";
import { safeNext, siteUrl } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; sent?: boolean } | undefined;

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for every failure: never reveal whether an email has an account.
  if (error) return { error: "That email and password don't match. Try again or reset your password." };
  const { data: isStaff } = await supabase.rpc("staff_pending_mfa");
  redirect(isStaff ? "/console/mfa" : safeNext(String(form.get("next") ?? ""), "/app"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/set-password`,
  });
  return { sent: true };
}

export async function setPassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  if (password !== form.get("confirm")) return { error: "The two passwords don't match." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your link expired. Ask us for a new invitation or reset your password." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  const { data: isStaff } = await supabase.rpc("staff_pending_mfa");
  redirect(isStaff ? "/console/mfa" : "/app");
}
