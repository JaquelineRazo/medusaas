import Link from "next/link";
import { Mavi } from "@/components/Jellyfish";
import { StatusBadge } from "@/components/StatusBadge";
import { activity, plan, projects, user } from "@/lib/mock";

export default function ClientHome() {
  const used = Math.round(((plan.totalDays - plan.daysLeft) / plan.totalDays) * 100);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Hi, {user.firstName} 👋</h1>
      <p className="mt-1 text-muted">
        Everything in one place. Tell us what you need and we&apos;ll take care of it.
      </p>

      <section className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr_0.8fr]">
        <div className="flex flex-col gap-4 rounded-3xl bg-ink p-6 text-cream">
          <div className="flex items-center gap-3">
            <Mavi size={44} float />
            <h2 className="text-lg font-semibold">Send a request</h2>
          </div>
          <p className="text-sm text-cream/80">
            Talk to Mavi and tell us what you need.
          </p>
          <Link
            href="/app/conversations/new"
            className="self-start rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Start a conversation →
          </Link>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">Your plan</p>
          <p className="text-lg font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm text-muted">Valid until {plan.validUntil}</p>
          <div
            className="mt-4 h-2 rounded-full bg-cream"
            role="progressbar"
            aria-label="Included support used"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-2 rounded-full bg-sunshine" style={{ width: `${used}%` }} />
          </div>
          <p className="mt-2 text-right text-sm font-medium">{plan.daysLeft} days left</p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">Active projects</p>
          <p className="mt-2 text-4xl font-bold">{projects.length}</p>
          <Link href="/app/projects" className="mt-3 inline-block text-sm font-medium text-honey">
            View projects →
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">My projects</h2>
          <Link href="/app/projects" className="text-sm font-medium text-honey">
            View all →
          </Link>
        </div>
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/projects/${p.id}`}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface p-4 hover:border-sunshine"
              >
                <span className="min-w-40">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="text-sm text-muted">{p.url}</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                  {p.online ? "Online" : "Offline"}
                </span>
                <span className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </span>
                <span className="ml-auto text-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Link href="/app/requests" className="text-sm font-medium text-honey">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {activity.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1 font-medium">{a.title}</span>
              <span className="text-muted">{a.when}</span>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
