"use client";

import { useEffect, useRef, useState } from "react";
import { Bubble, Card, ChatHeader, Composer, Primary, Secondary } from "@/components/chat";
import { projects, sampleQuote as q, user } from "@/lib/mock";

// Scripted intake for the Phase 1 prototype (COPY.md, master §23). No AI, no backend.
type Step =
  | "intent"
  | "project"
  | "details"
  | "summary"
  | "assessing"
  | "quote"
  | "payment"
  | "working";

type Msg =
  | { from: "bot" | "client"; text: string }
  | { from: "card"; kind: "summary" | "quote" | "payment" | "timeline" };

const chips = ["Change something", "Something's broken", "Ask a question", "New project"];
const detailQuestions = [
  "Do you already have the content (text, photos)?",
  "Where should it go on the page?",
  "Is there a reference you like?",
];
const timeline = [
  { label: "Payment confirmed", note: "Today, 10:32 AM" },
  { label: "In progress", note: "Our team is working on it." },
  { label: "In review", note: "We'll let you know when it's ready." },
  { label: "Completed", note: "Done! You can see the changes on your site." },
];

export function Conversation() {
  const [step, setStep] = useState<Step>("intent");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: `Hi ${user.firstName}! 👋 What would you like to do today? You can tell me in your own words, send a screenshot or share an example.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [request, setRequest] = useState("");
  const [project, setProject] = useState("");
  const [progress, setProgress] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, progress]);

  const push = (...m: Msg[]) => setMsgs((prev) => [...prev, ...m]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setDraft("");
    push({ from: "client", text: t });
    if (step === "intent") {
      setRequest(t);
      setStep("project");
      push({ from: "bot", text: "Sure! Which project is this about?" });
    } else if (step === "details") {
      setStep("summary");
      push(
        { from: "bot", text: "Thanks, that helps." },
        { from: "card", kind: "summary" },
      );
    }
  }

  function pickProject(name: string) {
    setProject(name);
    push(
      { from: "client", text: name },
      {
        from: "bot",
        text: "Got it. To give you a cost and time estimate, I need a few details:\n• " +
          detailQuestions.join("\n• "),
      },
    );
    setStep("details");
  }

  function confirmSummary() {
    setStep("assessing");
    push(
      { from: "client", text: "Looks right" },
      {
        from: "bot",
        text: `Thanks! I created ticket ${q.ticketId}. Our team is assessing the work; you'll see the cost and estimated time here soon, usually within 1 business day.`,
      },
    );
  }

  function simulateAssessment() {
    setStep("quote");
    push(
      { from: "bot", text: "Based on what you shared, here's the quote:" },
      { from: "card", kind: "quote" },
    );
  }

  function approve() {
    setStep("payment");
    push({ from: "client", text: "Approve & pay" }, { from: "card", kind: "payment" });
  }

  function pay() {
    setStep("working");
    setProgress(1);
    push({ from: "card", kind: "timeline" });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col rounded-3xl border border-line bg-surface">
      <ChatHeader
        action={
          <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:bg-cream">
            Talk to a person
          </button>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6" aria-live="polite">
        {msgs.map((m, i) => {
          if (m.from === "card") {
            return (
              <div key={i} className="ml-11">
                {m.kind === "summary" && (
                  <Card title="Here's what I understood">
                    <p className="text-sm">
                      {request} — on <strong>{project}</strong>, using the materials you
                      share.
                    </p>
                    {step === "summary" && (
                      <div className="mt-4 flex gap-2">
                        <Primary onClick={confirmSummary}>Looks right</Primary>
                        <Secondary>Edit</Secondary>
                      </div>
                    )}
                  </Card>
                )}
                {m.kind === "quote" && (
                  <Card title={`Quote · ${q.title}`} meta={`${q.ticketId} · v${q.version}`}>
                    <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                      <dt className="text-muted">Estimated effort</dt>
                      <dd className="text-right font-medium">{q.effortHours} hours</dd>
                      <dt className="text-muted">Delivery window</dt>
                      <dd className="text-right font-medium">{q.deliveryWindow}</dd>
                      <dt className="text-muted">Valid until</dt>
                      <dd className="text-right font-medium">{q.validUntil}</dd>
                    </dl>
                    <p className="mt-3 text-sm text-muted">Includes</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {q.includes.map((x) => (
                        <li key={x}>✓ {x}</li>
                      ))}
                    </ul>
                    <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                      <span>Total</span>
                      <span>
                        ${q.amount} {q.currency} <span className="font-normal text-muted">+ tax</span>
                      </span>
                    </p>
                    {step === "quote" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Primary onClick={approve}>Approve &amp; pay</Primary>
                        <Secondary>Request changes</Secondary>
                      </div>
                    )}
                  </Card>
                )}
                {m.kind === "payment" && (
                  <Card title="Secure payment before we start">
                    <p className="flex justify-between text-sm">
                      <span className="text-muted">{q.title}</span>
                      <span className="font-semibold">
                        ${q.amount} {q.currency}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      We start once your payment is confirmed.
                    </p>
                    {step === "payment" && (
                      <div className="mt-4">
                        <Primary onClick={pay}>Pay &amp; authorize →</Primary>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted">🔒 Secure payment, processed by Stripe</p>
                  </Card>
                )}
                {m.kind === "timeline" && (
                  <Card title="Progress">
                    <ol className="space-y-3">
                      {timeline.map((t, idx) => {
                        const done = idx < progress;
                        return (
                          <li key={t.label} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                done ? "bg-sunshine" : "border-2 border-line"
                              }`}
                            />
                            <span className={done ? "" : "text-muted"}>
                              <span className="block text-sm font-semibold">{t.label}</span>
                              <span className="text-xs">{t.note}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    {progress < timeline.length && (
                      <div className="mt-4">
                        <Secondary onClick={() => setProgress((p) => p + 1)}>
                          Prototype: advance status
                        </Secondary>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            );
          }
          return <Bubble key={i} from={m.from} text={m.text} />;
        })}

        {step === "intent" && (
          <div className="ml-11 flex flex-wrap gap-2">
            {chips.map((c) => (
              <Secondary key={c} onClick={() => setDraft(c + ": ")}>
                {c}
              </Secondary>
            ))}
          </div>
        )}
        {step === "project" && (
          <div className="ml-11 flex flex-wrap gap-2">
            {projects.map((p) => (
              <Secondary key={p.id} onClick={() => pickProject(p.name)}>
                {p.name}
              </Secondary>
            ))}
          </div>
        )}
        {step === "assessing" && (
          <div className="ml-11">
            <Secondary onClick={simulateAssessment}>
              Prototype: team sends the quote
            </Secondary>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <Composer
        value={draft}
        onChange={setDraft}
        onSend={() => send(draft)}
        disabled={step !== "intent" && step !== "details"}
      />
      <p className="px-5 pb-3 text-center text-[11px] text-muted">
        Mavi is a virtual assistant. Prices are always confirmed by our team.
      </p>
    </div>
  );
}

