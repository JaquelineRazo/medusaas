"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bubble, Card, ChatHeader, Primary, Secondary } from "@/components/chat";
import { createRequest, type Kind } from "./actions";

const kindOptions: { kind: Kind; label: string; ask: string }[] = [
  { kind: "issue", label: "Report an issue", ask: "Sorry about that. What's happening? Tell me what you see and where." },
  { kind: "change", label: "Request a change", ask: "Sure. What would you like to change?" },
  { kind: "new", label: "Something new", ask: "Love it. What would you like to add or build?" },
  { kind: "question", label: "Ask a question", ask: "Of course. What would you like to know?" },
];

type Msg = { from: "bot" | "client"; text: string };

export function Conversation({
  firstName,
  projects,
  initialKind,
  initialProject,
}: {
  firstName: string;
  projects: { id: string; name: string }[];
  initialKind?: Kind;
  initialProject?: string;
}) {
  const [kind, setKind] = useState<Kind | undefined>(initialKind);
  const [projectId, setProjectId] = useState<string | null | undefined>(
    initialProject ?? (projects.length === 1 ? projects[0].id : undefined),
  );
  const [details, setDetails] = useState("");
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<{ id?: string; code?: string; error?: string } | null>(null);
  const [pending, start] = useTransition();

  const option = kindOptions.find((o) => o.kind === kind);
  const project = projects.find((p) => p.id === projectId);
  const msgs: Msg[] = [{ from: "bot", text: `Hi${firstName ? ` ${firstName}` : ""}! I'm Mavi. What do you need today?` }];
  if (option) msgs.push({ from: "client", text: option.label });
  if (option && projects.length > 1) {
    msgs.push({ from: "bot", text: "Which project is it about?" });
    if (projectId !== undefined) msgs.push({ from: "client", text: project?.name ?? "I'm not sure" });
  }
  if (option && projectId !== undefined) msgs.push({ from: "bot", text: option.ask });
  if (details) msgs.push({ from: "client", text: details });

  const step = !option ? "kind" : projectId === undefined ? "project" : !details ? "details" : result?.id ? "done" : "summary";

  function send() {
    start(async () => setResult(await createRequest({ kind: kind!, projectId: projectId ?? null, details })));
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-surface lg:h-[calc(100dvh-7rem)]">
      <ChatHeader />
      <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
        {msgs.map((m, i) => (
          <Bubble key={i} from={m.from} text={m.text} />
        ))}

        {step === "kind" && (
          <div className="ml-11 flex flex-wrap gap-2">
            {kindOptions.map((o) => (
              <Secondary key={o.kind} onClick={() => setKind(o.kind)}>{o.label}</Secondary>
            ))}
          </div>
        )}
        {step === "project" && (
          <div className="ml-11 flex flex-wrap gap-2">
            {projects.map((p) => (
              <Secondary key={p.id} onClick={() => setProjectId(p.id)}>{p.name}</Secondary>
            ))}
            <Secondary onClick={() => setProjectId(null)}>I&apos;m not sure</Secondary>
          </div>
        )}
        {(step === "summary" || step === "done") && (
          <div className="ml-11">
            <Card title="Your request" meta={step === "done" ? result?.code : "Review before sending"}>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2"><dt className="text-muted">Type:</dt><dd>{option?.label}</dd></div>
                <div className="flex gap-2"><dt className="text-muted">Project:</dt><dd>{project?.name ?? "Not sure"}</dd></div>
                <div><dt className="text-muted">Details:</dt><dd className="whitespace-pre-line">{details}</dd></div>
              </dl>
              {step === "summary" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Primary onClick={send} disabled={pending}>{pending ? "Sending…" : "Send to the team"}</Primary>
                  <Secondary onClick={() => { setDraft(details); setDetails(""); }}>Edit</Secondary>
                </div>
              )}
              {result?.error && <p role="alert" className="mt-3 text-sm text-danger">{result.error}</p>}
            </Card>
          </div>
        )}
        {step === "done" && (
          <>
            <Bubble
              from="bot"
              text={`Got it! ${result?.code} is with our team. A person reviews every request; you'll get a notification and an email as it moves. Nothing is charged or started without your approval.`}
            />
            <div className="ml-11">
              <Link href={`/app/requests/${result?.id}`} className="inline-block rounded-full bg-sunshine px-5 py-2 text-sm font-semibold text-ink">
                Track it →
              </Link>
            </div>
          </>
        )}
      </div>
      {step === "details" && (
        <form
          className="flex items-end gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim().length >= 5) setDetails(draft.trim());
          }}
        >
          <label htmlFor="msg" className="sr-only">Message to Mavi</label>
          <textarea
            id="msg"
            rows={2}
            autoFocus
            maxLength={4000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Type your message…"
            className="min-w-0 flex-1 resize-none rounded-2xl bg-cream px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" aria-label="Send" disabled={draft.trim().length < 5} className="grid h-10 w-10 place-items-center rounded-full bg-sunshine font-bold text-ink disabled:opacity-40">
            ↑
          </button>
        </form>
      )}
    </div>
  );
}
