import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { NameForm } from "./NameForm";

export default async function AccountPage() {
  const { user, profile, orgs } = await requireClient();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="My account" subtitle={orgs.map((o) => o.name).join(", ")} />
      <Panel title="Profile">
        <NameForm name={profile?.full_name ?? ""} />
        <dl className="mt-4 text-sm">
          <dt className="text-muted">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </dl>
      </Panel>
      <Panel title="Team">
        <p className="text-sm text-muted">Want someone else from your company to follow requests? Ask us and we&apos;ll invite them.</p>
        <Link href="/app/conversations/new?intent=change" className="mt-3 inline-block text-sm font-medium text-honey">
          Ask for an invitation →
        </Link>
      </Panel>
      <Panel title="Security">
        <Link href="/set-password" className="text-sm font-medium text-honey">Change password →</Link>
      </Panel>
    </div>
  );
}
