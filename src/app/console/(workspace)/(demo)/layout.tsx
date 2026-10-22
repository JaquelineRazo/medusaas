// Modules from later phases (BRIEF.md §4) still run on sample data: say so clearly.
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p role="note" className="mx-auto mb-4 max-w-6xl rounded-2xl border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted">
        <span className="font-semibold text-ink">Demo data.</span> This module arrives in a later phase; nothing here is
        real yet.
      </p>
      {children}
    </>
  );
}
