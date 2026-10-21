import { PageHeader, Panel, Pill } from "@/components/ui";
import { user } from "@/lib/mock";

const team = [
  { name: "Ana López", email: "ana@tusitio.com", role: "Owner", note: "Approves quotes and payments" },
  { name: "Carlos Ruiz", email: "carlos@tusitio.com", role: "Collaborator", note: "Can open and follow requests" },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="My account" subtitle={user.org} />
      <Panel title="Profile">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{user.firstName} {user.lastName}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">ana@tusitio.com</dd>
          </div>
        </dl>
      </Panel>
      <Panel
        title="Team"
        action={
          <button type="button" className="rounded-full border border-line px-4 py-1.5 text-sm font-medium hover:bg-cream">
            Invite someone
          </button>
        }
      >
        <ul className="divide-y divide-line">
          {team.map((m) => (
            <li key={m.email} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{m.name}</span>
                <span className="text-muted">{m.email}</span>
              </span>
              <span className="text-xs text-muted">{m.note}</span>
              <Pill tone={m.role === "Owner" ? "gold" : "neutral"}>{m.role}</Pill>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Security">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            <span className="block font-medium">Two-step verification</span>
            <span className="text-muted">Recommended. Adds a code from your phone when you sign in.</span>
          </span>
          <button type="button" className="rounded-full bg-sunshine px-4 py-2 text-sm font-semibold text-ink">
            Turn on
          </button>
        </div>
        <div className="mt-4 border-t border-line pt-4 text-sm">
          <button type="button" className="font-medium text-honey">
            Change password
          </button>
        </div>
      </Panel>
    </div>
  );
}
