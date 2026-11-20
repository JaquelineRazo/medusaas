import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { needsCodeToChoosePassword } from "@/lib/passwords";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "./SetPasswordForm";

// Reached from an invitation or reset email (via /auth/confirm, which opens the session).
export default async function SetPassword() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?link=expired");
  const needsCode = await needsCodeToChoosePassword(supabase);
  return (
    <AuthCard title="Choose your password" subtitle={`For ${user.email}. Use at least 10 characters.`}>
      <SetPasswordForm needsCode={needsCode} />
    </AuthCard>
  );
}
