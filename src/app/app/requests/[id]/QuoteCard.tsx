"use client";

import { useState } from "react";
import { Panel, ProtoNote, money } from "@/components/ui";
import type { Quote } from "@/lib/mock";

// Approve → Pay → Execute. In Phase 3 "paid" only comes from a verified Stripe webhook.
export function QuoteCard({ ticketId, quote: q }: { ticketId: string; quote: Quote }) {
  const [state, setState] = useState<"review" | "approved" | "paid">("review");
  const [agreed, setAgreed] = useState(false);
  const deposit = q.payment === "50% deposit" ? q.amount / 2 : q.amount;

  return (
    <Panel title={`Quote · v${q.version}`} action={<span className="text-xs text-muted">{ticketId}</span>}>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted">Estimated effort</dt>
        <dd className="text-right font-medium">{q.effortHours} hours</dd>
        <dt className="text-muted">Delivery window</dt>
        <dd className="text-right font-medium">{q.deliveryWindow}</dd>
        <dt className="text-muted">Payment</dt>
        <dd className="text-right font-medium">{q.payment}</dd>
        <dt className="text-muted">Valid until</dt>
        <dd className="text-right font-medium">{q.validUntil}</dd>
      </dl>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-muted uppercase">Includes</p>
          <ul className="mt-1 space-y-1 text-sm">
            {q.includes.map((x) => (
              <li key={x}>✓ {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted uppercase">Not included</p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {q.excludes.map((x) => (
              <li key={x}>– {x}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
        <span>Total</span>
        <span>
          {money(q.amount, q.currency)} <span className="font-normal text-muted">+ tax</span>
        </span>
      </p>

      {state === "review" && (
        <>
          <label className="mt-4 flex gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />I approve this
            scope and price (version {q.version}). Any change in scope will need a new quote.
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setState("approved")}
              disabled={!agreed}
              className="rounded-full bg-sunshine px-5 py-2 text-sm font-semibold text-ink hover:brightness-95 disabled:opacity-40"
            >
              Approve &amp; pay
            </button>
            <button type="button" className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
              Request changes
            </button>
          </div>
        </>
      )}
      {state === "approved" && (
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <p className="text-sm font-semibold">Secure payment before we start</p>
          <p className="mt-1 text-sm text-muted">
            Due now: {money(deposit, q.currency)} + tax
            {q.payment === "50% deposit" && " (balance due before final delivery)"}
          </p>
          <button
            type="button"
            onClick={() => setState("paid")}
            className="mt-3 rounded-full bg-sunshine px-5 py-2 text-sm font-semibold text-ink hover:brightness-95"
          >
            Pay &amp; authorize →
          </button>
          <p className="mt-2 text-xs text-muted">🔒 Secure payment, processed by Stripe</p>
        </div>
      )}
      {state === "paid" && (
        <p className="mt-4 rounded-2xl bg-[#E6F4EC] p-4 text-sm text-success">
          Payment confirmed. Our team will start and keep you posted here.
        </p>
      )}
      <ProtoNote>approval and payment are simulated; nothing is charged.</ProtoNote>
    </Panel>
  );
}
