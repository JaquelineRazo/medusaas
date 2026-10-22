import Link from "next/link";
import { DeepSea } from "./DeepSea";
import { Wordmark } from "./Jellyfish";

// Shared frame for the secondary auth screens (set password, reset, MFA).
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 text-cream">
      <DeepSea moments={false} />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark descriptor size={34} />
        </Link>
        <div className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(255,243,210,0.94))] p-8 text-ink shadow-[0_0_0_1px_rgba(255,232,154,0.55),0_0_80px_-16px_rgba(247,201,72,0.45)] sm:p-10">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export const inputClass = "mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-ink";
export const submitClass = "h-11 w-full rounded-full bg-sunshine font-semibold text-ink hover:brightness-95 disabled:opacity-60";
