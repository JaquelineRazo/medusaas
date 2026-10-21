import Link from "next/link";
import { PageHeader, Pill, money } from "@/components/ui";
import { clients } from "@/lib/mock";

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Clients"
        subtitle="Accounts are created here. Clients get an invitation link to set their password."
        action={
          <button type="button" className="rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink">
            New client
          </button>
        }
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link href={`/console/clients/${c.id}`} className="block h-full rounded-3xl border border-line bg-surface p-6 hover:border-sunshine">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{c.name}</p>
                  <p className="text-sm text-muted">{c.contact} · {c.email}</p>
                </div>
                <div className="flex gap-1">
                  {c.ventures.map((v) => (
                    <Pill key={v} tone="ink">{v}</Pill>
                  ))}
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Plan</dt>
                  <dd className="font-medium">{c.plan}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Balance</dt>
                  <dd className={`font-medium ${c.balance ? "text-warning" : ""}`}>{money(c.balance)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Hours this month</dt>
                  <dd className="font-medium">{c.hoursThisMonth}h</dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
