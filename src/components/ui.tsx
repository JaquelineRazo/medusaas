import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-block text-sm font-medium text-honey">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const pillTone = {
  neutral: "border border-line text-muted",
  gold: "bg-soft-gold text-honey",
  warning: "bg-soft-gold text-warning",
  success: "bg-[#E6F4EC] text-success",
  danger: "bg-[#FDECEA] text-danger",
  ink: "bg-ink text-cream",
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof pillTone;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${pillTone[tone]}`}>
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-block rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
          : "inline-block rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium hover:bg-cream"
      }
    >
      {children}
    </Link>
  );
}

export function money(amount: number, currency = "USD") {
  return `$${amount.toLocaleString("en-US")} ${currency}`;
}

// A prototype marker for actions that will do something real in later phases.
export function ProtoNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs text-muted italic">Prototype: {children}</p>;
}
