"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { str } from "@/lib/form";

export async function updateName(_: unknown, form: FormData) {
  const name = str(form, "full_name", 120);
  if (!name) return { error: "Write your name." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
  if (error) return { error: "Couldn't save. Try again." };
  revalidatePath("/app", "layout");
  return { ok: true };
}
