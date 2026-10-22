"use client";

import { useState } from "react";
import { Mavi } from "@/components/Jellyfish";
import { Panel, Pill, ProtoNote } from "@/components/ui";
import { leads } from "@/lib/mock";

export function Inbox() {
  const [selected, setSelected] = useState(leads[0].id);
  const [converted, setConverted] = useState<string[]>([]);
  const lead = leads.find((l) => l.id === selected)!;
  const done = converted.includes(lead.id) || lead.stage === "Won";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <ul className="space-y-2">
        {leads.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => setSelected(l.id)}
              aria-pressed={l.id === selected}
              className={`w-full rounded-2xl border p-4 text-left ${
                l.id === selected ? "border-sunshine bg-surface" : "border-line bg-surface hover:border-soft-gold"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold">{l.name}</span>
                <span className="text-xs text-muted">{l.received}</span>
              </span>
              <span className="mt-1 block truncate text-sm text-muted">{l.need}</span>
              <span className="mt-2 flex gap-2">
                <Pill tone={l.source === "Mavi" ? "gold" : "neutral"}>{l.source}</Pill>
                <Pill tone={l.stage === "New" ? "warning" : l.stage === "Won" ? "success" : "neutral"}>{l.stage}</Pill>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Panel title={lead.name} action={<span className="text-xs text-muted">{lead.id}</span>}>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium break-all">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Likely venture</dt>
            <dd className="font-medium">{lead.venture}</dd>
          </div>
          <div>
            <dt className="text-muted">Source</dt>
            <dd className="font-medium">{lead.source}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <p className="text-xs font-semibold text-muted uppercase">Mavi&apos;s summary</p>
          <p className="mt-1 text-sm">{lead.need}</p>
        </div>

        {lead.transcript.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-muted uppercase">Conversation</p>
            <ul className="space-y-2">
              {lead.transcript.map((m, i) => (
                <li key={i} className={`flex gap-2 ${m.from === "client" ? "justify-end" : ""}`}>
                  {m.from === "bot" && <Mavi size={22} className="shrink-0" />}
                  {/* Visitor text is rendered as plain text, never HTML (BRIEF.md §1.2). */}
                  <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === "bot" ? "bg-cream" : "bg-soft-gold"}`}>
                    {m.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <label className="mt-4 block text-sm">
          <span className="font-medium">Internal note</span>
          <textarea rows={2} className="mt-1 w-full rounded-xl bg-cream p-3 outline-none" placeholder="Only your team sees this" />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {done ? (
            <Pill tone="success">Client, project draft and invitation created</Pill>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConverted((c) => [...c, lead.id])}
                className="rounded-full bg-sunshine px-5 py-2 text-sm font-semibold text-ink hover:brightness-95"
              >
                Convert to client
              </button>
              <button type="button" className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
                Reply by email
              </button>
              <button type="button" className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
                Mark as lost
              </button>
            </>
          )}
        </div>
        <ProtoNote>converting creates the organization, a project draft and an invitation link in Phase 2.</ProtoNote>
      </Panel>
    </div>
  );
}
