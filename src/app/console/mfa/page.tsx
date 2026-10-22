import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/server";
import { MfaForm } from "./MfaForm";

export const metadata = { title: "Verify · meduSAAS", robots: { index: false } };

// Staff always pass a second factor (authenticator app) before the Admin Workspace.
export default async function MfaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: isStaff } = await supabase.rpc("staff_pending_mfa");
  if (!isStaff) redirect("/app");
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const enrolled = (factors?.totp ?? []).some((f) => f.status === "verified");
  return (
    <AuthCard
      title={enrolled ? "Enter your code" : "Protect the Admin Workspace"}
      subtitle={
        enrolled
          ? "Open your authenticator app and type the 6-digit code for meduSAAS."
          : "Scan this code with an authenticator app (Google Authenticator, 1Password, Authy), then type the 6-digit code."
      }
    >
      <MfaForm enrolled={enrolled} />
    </AuthCard>
  );
}
