"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Primary } from "@/components/chat";
import { Mavi, Wordmark } from "@/components/Jellyfish";
import { DeepSea } from "@/components/DeepSea";

// Scripted public intake for the Phase 1 prototype (COPY.md "Public site").
// The real version (Phase 3) is an LLM with zero privileges: BRIEF.md §1.2.
type Step = "need" | "clarify" | "contact" | "done";
type Msg = { from: "bot" | "client"; text: string };

const chips = ["A new website", "An app or system", "A data project", "Just exploring"];
const OUT_OF_SCOPE =
  "I can only help with our digital services, like websites, apps, systems and data projects. What would you like to build?";
const NO_PRICES =
  "I can't give prices here. A person on our team reviews every request and sends you a clear quote first.";

// Prototype stand-in for the scope classifier; the real one runs server-side.
function guard(text: string): string | null {
  if (/ignore (all|previous)|system prompt|password|other clients|api key/i.test(text)) return OUT_OF_SCOPE;
  if (/price|cost|how much|cheap|discount/i.test(text)) return NO_PRICES;
  return null;
}

export function PublicChat() {
  const [step, setStep] = useState<Step>("need");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const started = msgs.length > 0;

  useEffect(() => {
    if (started) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, step, started]);

  const push = (...m: Msg[]) => setMsgs((prev) => [...prev, ...m]);

  // Home links open the chat with a chip already chosen (?start=). Only chip values are
  // accepted, so nothing arbitrary can be injected through the URL.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    const start = new URLSearchParams(window.location.search).get("start");
    if (start && chips.includes(start)) queueMicrotask(() => send(start));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on load
  }, []);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setDraft("");
    const blocked = guard(t);
    if (blocked) {
      push({ from: "client", text: t }, { from: "bot", text: blocked });
      return;
    }
    if (step === "need") {
      setStep("clarify");
      push(
        { from: "client", text: t },
        {
          from: "bot",
          text: "Love it! Tell me a bit more: what should it help you or your customers do? If you have an example or a link you like, share it too.",
        },
      );
    } else if (step === "clarify") {
      setStep("contact");
      push(
        { from: "client", text: t },
        { from: "bot", text: "Great, I have what I need. Where can our team reach you?" },
      );
    }
  }

  function submitContact(e: React.FormEvent) {
    e.preventDefault();
    setStep("done");
    push({
      from: "bot",
      text: `Thanks, ${name}! Your request is with our team. We'll reply to ${email}, usually within 1 business day. No prices or dates are promised here; you'll get a clear quote first.`,
    });
  }

  const composer = (
    <BigComposer
      value={draft}
      onChange={setDraft}
      onSend={() => send(draft)}
      disabled={step === "contact" || step === "done"}
      placeholder={started ? "Reply to Mavi…" : "Tell Mavi what you'd like to build…"}
    />
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#1d1b17] text-cream">
      <DeepSea moments={false} className={started ? "opacity-50" : ""} />
      <header className="relative flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/">
          <Wordmark size={28} />
        </Link>
        <Link href="/sign-in" className="text-sm font-semibold text-cream/80 hover:text-soft-gold">
          Client sign in
        </Link>
      </header>

      {!started ? (
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <h1 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
            Hi, I&apos;m Mavi. What would you like to{" "}
            <span className="font-accent text-[1.15em] font-normal tracking-normal text-soft-gold italic">build?</span>
          </h1>
          <p className="mt-3 text-center text-cream/75">
            Tell me in your own words. A person on our team reviews every request.
          </p>
          <div className="relative mt-32 w-full max-w-2xl">
            {/* Mavi greets the visitor, then swims round the box inviting them to write. */}
            <div aria-hidden="true" className={`mavi-swim pointer-events-none absolute z-10 ${draft ? "is-attentive" : ""}`}>
              <Mavi size={64} className="mavi-glow" />
            </div>
            {composer}
          </div>
          <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="rounded-full border border-cream/15 bg-cream/5 px-4 py-2 text-sm font-medium backdrop-blur transition hover:border-soft-gold"
              >
                {c}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          <main className="relative flex-1 overflow-y-auto px-4" aria-live="polite">
            <div className="mx-auto max-w-2xl space-y-6 py-6">
              {msgs.map((m, i) =>
                m.from === "bot" ? (
                  <div key={i} className="flex gap-3">
                    <Mavi size={30} className="mt-0.5 shrink-0" />
                    <p className="leading-relaxed text-cream/90">{m.text}</p>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[80%] rounded-3xl bg-soft-gold px-5 py-3 leading-relaxed text-ink">
                      {m.text}
                    </p>
                  </div>
                ),
              )}
              {step === "contact" && (
                <form
                  onSubmit={submitContact}
                  className="ml-11 max-w-sm space-y-3 rounded-3xl bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(255,243,210,0.94))] text-ink shadow-[0_0_0_1px_rgba(255,232,154,0.55),0_0_70px_-16px_rgba(247,201,72,0.5)] p-5"
                >
                  <Field label="Name" value={name} onChange={setName} autoComplete="name" />
                  <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                  <p className="text-xs text-muted">
                    We only use this to reply to your request. See our privacy notice.
                  </p>
                  <Primary type="submit">Send to the team</Primary>
                </form>
              )}
              {step === "done" && (
                <p className="ml-11 text-sm text-cream/70">
                  Already a client?{" "}
                  <Link href="/sign-in" className="font-medium text-soft-gold underline">
                    Sign in to your workspace
                  </Link>
                </p>
              )}
              <div ref={endRef} />
            </div>
          </main>
          <div className="relative px-4 pb-2">
            <div className="mx-auto max-w-2xl">{composer}</div>
          </div>
        </>
      )}
      <p className="relative px-4 pb-3 text-center text-xs text-cream/60">
        Mavi is a virtual assistant. It never sets prices; a person reviews every request.
      </p>
    </div>
  );
}

function BigComposer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className="glow-within rounded-3xl bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(255,243,210,0.94))] text-ink shadow-[0_0_0_1px_rgba(255,232,154,0.55),0_0_70px_-16px_rgba(247,201,72,0.5)] p-3"
    >
      <label htmlFor="mavi-input" className="sr-only">
        Message to Mavi
      </label>
      <textarea
        id="mavi-input"
        rows={2}
        maxLength={1000}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        className="block w-full resize-none bg-transparent px-2 py-1 leading-relaxed outline-none disabled:opacity-50"
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Attach a file"
          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/60 text-lg hover:bg-cream"
        >
          +
        </button>
        <button
          type="submit"
          aria-label="Send"
          disabled={disabled || !value.trim()}
          className="grid h-9 w-9 place-items-center rounded-full bg-sunshine font-bold text-ink disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        required
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-ink"
      />
    </label>
  );
}
