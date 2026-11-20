"use server";

import { redirect } from "next/navigation";
import { landingFor, readSession } from "@/lib/access";
import { siteUrl } from "@/lib/auth";
import { str } from "@/lib/form";
import { choosePassword } from "@/lib/passwords";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; sent?: boolean } | undefined;

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for every failure: never reveal whether an email has an account.
  if (error) return { error: "That email and password don't match. Try again or reset your password." };
  const { session } = await readSession(supabase);
  redirect(landingFor(session, str(form, "next", 500)));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/set-password`,
  });
  return { sent: true };
}

export async function setPassword(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await createClient();
  const res = await choosePassword(supabase, {
    password: String(form.get("password") ?? ""),
    confirm: String(form.get("confirm") ?? ""),
    code: str(form, "code", 12),
  });
  if ("error" in res) return { error: res.error };
  const { session } = await readSession(supabase);
  redirect(landingFor(session, null));
}
