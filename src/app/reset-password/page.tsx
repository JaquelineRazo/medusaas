import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { ResetForm } from "./ResetForm";

export default function ResetPassword() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email. If you have an account, we'll send you a link to set a new password."
    >
      <ResetForm />
      <Link href="/sign-in" className="mt-5 inline-block text-sm font-medium text-honey">
        ← Back to sign in
      </Link>
    </AuthCard>
  );
}
