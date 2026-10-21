"use client";

import { useState } from "react";
import { Panel, Pill, ProtoNote, money } from "@/components/ui";
import type { Ticket } from "@/lib/mock";

// Assessment + quote builder (master §5–6). Placeholder rates, not an approved rate card.
const RATE = 50; // client rate per hour
const INTERNAL = 35; // internal value of an hour, for profitability

type Coverage = "Warranty" | "Plan" | "Project scope" | "Pay per incident";
type Stage = "assessing" | "quote_sent" | "approved" | "paid" | "in_progress";

const initialStage: Record<string, Stage> = {
  quote_ready: "quote_sent",
  awaiting_payment: "approved",
  in_progress: "in_progress",
  client_review: "in_progress",
  completed: "in_progress",
};

export function Assessment({ ticket }: { ticket: Ticket }) {
  const [coverage, setCoverage] = useState<Coverage>(
    ticket.coverage === "To assess" ? "Pay per incident" : (ticket.coverage as Coverage),
  );
  const [hours, setHours] = useState({ min: 2, expected: 3, max: 4 });
  const [external, setExternal] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [payment, setPayment] = useState<"Full payment" | "50% deposit">("Full payment");
  const [delivery, setDelivery] = useState("2–3 business days after payment");
  const [rationale, setRationale] = useState("");
  const [stage, setStage] = useState<Stage>(initialStage[ticket.status] ?? "assessing");
  const [version, setVersion] = useState(1);

  const included = coverage !== "Pay per incident";
  const price = included ? 0 : Math.round((hours.expected * RATE + external) * (1 + buffer / 100));
  const internalCost = hours.expected * INTERNAL + external;
  const locked = stage !== "assessing";
  // "paid" also covers $0 work once its assessment is recorded.
  const canStart = stage === "paid";

  function submit() {
    if (!rationale.trim()) return;
    // Covered work skips quote and payment, but the assessment is still recorded.
    setStage(included ? "paid" : "quote_sent");
  }

  return (
    <Panel
      title="Assessment & quote"
      action={<Pill tone={included ? "success" : "gold"}>{included ? "$0 · covered" : `Quote v${version}`}</Pill>}
    >
      <fieldset disabled={locked} className="space-y-4 disabled:opacity-70">
        <label className="block text-sm">
          <span className="font-medium">Coverage</span>
          <select
            value={coverage}
            onChange={(e) => setCoverage(e.target.value as Coverage)}
            className="mt-1 h-10 w-full rounded-xl bg-cream px-3"
          >
            <option>Warranty</option>
            <option>Plan</option>
            <option>Project scope</option>
            <option>Pay per incident</option>
          </select>
        </label>

        <div>
          <p className="text-sm font-medium">Estimated effort (hours)</p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["min", "expected", "max"] as const).map((k) => (
              <label key={k} className="text-xs text-muted">
                {k}
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={hours[k]}
                  onChange={(e) => setHours({ ...hours, [k]: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl bg-cream px-3 text-sm text-ink"
                />
              </label>
            ))}
          </div>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Delivery window</span>
          <span className="block text-xs text-muted">Separate from effort: 3 hours of work isn&apos;t 3 hours to deliver.</span>
          <input value={delivery} onChange={(e) => setDelivery(e.target.value)} className="mt-1 h-10 w-full rounded-xl bg-cream px-3" />
        </label>

        {!included && (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="font-medium">Third-party costs</span>
              <input type="number" min={0} value={external} onChange={(e) => setExternal(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl bg-cream px-3" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Buffer %</span>
              <input type="number" min={0} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl bg-cream px-3" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Payment</span>
              <select value={payment} onChange={(e) => setPayment(e.target.value as typeof payment)} className="mt-1 h-10 w-full rounded-xl bg-cream px-3">
                <option>Full payment</option>
                <option>50% deposit</option>
              </select>
            </label>
          </div>
        )}

        <label className="block text-sm">
          <span className="font-medium">Rationale (required)</span>
          <textarea
            rows={2}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder={included ? "Why this is covered, e.g. bug in delivered contact form" : "Scope, exclusions and risks"}
            className="mt-1 w-full rounded-xl bg-cream p-3"
          />
        </label>
      </fieldset>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 rounded-2xl bg-cream p-4 text-sm">
        <dt className="text-muted">Client price</dt>
        <dd className="text-right text-lg font-bold">{money(price)} <span className="text-xs font-normal text-muted">+ tax</span></dd>
        {!included && payment === "50% deposit" && (
          <>
            <dt className="text-muted">Due before start</dt>
            <dd className="text-right font-medium">{money(price / 2)}</dd>
          </>
        )}
        <dt className="text-muted">Internal cost (never shown to client)</dt>
        <dd className="text-right font-medium">{money(internalCost)}</dd>
        {!included && (
          <>
            <dt className="text-muted">Estimated margin</dt>
            <dd className="text-right font-medium">{money(price - internalCost)}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 space-y-3">
        {stage === "assessing" && (
          <button
            type="button"
            onClick={submit}
            disabled={!rationale.trim()}
            className="rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {included ? "Record assessment" : `Send quote v${version} to client`}
          </button>
        )}
        {stage === "quote_sent" && (
          <Gate text="Quote sent. Waiting for the client to approve this exact version.">
            <Sim onClick={() => setStage("approved")}>Simulate: client approves</Sim>
            <button
              type="button"
              onClick={() => {
                setVersion((v) => v + 1);
                setStage("assessing");
              }}
              className="text-sm font-medium text-honey"
            >
              Revise scope (new version)
            </button>
          </Gate>
        )}
        {stage === "approved" && (
          <Gate text="Approved. Waiting for payment confirmation from Stripe (verified webhook only).">
            <Sim onClick={() => setStage("paid")}>Simulate: payment webhook</Sim>
          </Gate>
        )}
        {stage === "in_progress" ? (
          <Pill tone="success">Work in progress</Pill>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
            <button
              type="button"
              disabled={!canStart}
              onClick={() => setStage("in_progress")}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-30"
            >
              Start work
            </button>
            {!canStart && (
              <span className="text-xs text-muted">
                🔒 Locked until {included ? "the assessment is recorded" : "payment is confirmed"}.
              </span>
            )}
          </div>
        )}
      </div>
      <ProtoNote>in Phase 2 the lock is enforced in the database, not just this button.</ProtoNote>
    </Panel>
  );
}

function Gate({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="text-sm">{text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Sim({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-dashed border-honey px-4 py-1.5 text-sm text-honey">
      {children}
    </button>
  );
}
