import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Wordmark } from "@/components/Jellyfish";
import { user } from "@/lib/mock";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href="/app" className="lg:hidden">
            <Wordmark size={28} />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink font-semibold text-cream"
            >
              {user.firstName[0]}
            </span>
            <span className="hidden text-sm leading-tight sm:block">
              <span className="block font-semibold">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-muted">{user.role}</span>
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 pb-10 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
