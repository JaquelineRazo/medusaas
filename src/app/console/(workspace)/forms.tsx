"use client";

import { useActionState, useState } from "react";
import { addEvent, addProject, createClientAccount, inviteMember, moveTicket } from "./actions";
import type { Coverage, TicketStatus } from "@/lib/ticket-machine";
import { clientLabel } from "@/lib/ticket-machine";

const input = "mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink";
const label = "block text-sm";
const submit = "rounded-full bg-sunshine px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95 disabled:opacity-60";

function Field({ name, text, ...rest }: { name: string; text: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={label}>
      <span className="font-medium">{text}</span>
      <input name={name} className={input} {...rest} />
    </label>
  );
}

function Select({ name, text, options, defaultValue }: { name: string; text: string; options: [string, string][]; defaultValue?: string }) {
  return (
    <label className={label}>
      <span className="font-medium">{text}</span>
      <select name={name} defaultValue={defaultValue} className={input}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

const zones: [string, string][] = [
  ["America/Mexico_City", "Mexico City"],
  ["America/Los_Angeles", "Los Angeles"],
  ["America/New_York", "New York"],
  ["America/Tijuana", "Tijuana"],
  ["America/Monterrey", "Monterrey"],
];

/** The one-time link to choose a password. Shown once; the founder sends it or it goes by email. */
export function InviteLink({ link, email }: { link: string; email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" className="rounded-2xl border border-line bg-cream p-4 text-sm">
      <p className="font-semibold">Invitation ready for {email}</p>
      <p className="mt-1 text-muted">
        Send this link to them yourself (email or WhatsApp). It works once, opens a page to choose their own password,
        and expires in 24 hours. You can create a new one from the client page any time.
      </p>
      <div className="mt-3 flex gap-2">
        <input readOnly value={link} className={`${input} mt-0 font-mono text-xs`} onFocus={(e) => e.target.select()} aria-label="Invitation link" />
        <button type="button" className={submit} onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function ProjectFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field name="project_name" text="Project name" required maxLength={120} placeholder="Corporate website" />
      <Select name="venture" text="Venture" options={[["ORNIVA", "ORNIVA · Digital Growth"], ["VARKORA", "VARKORA · Industry Systems"], ["CYRANTA", "CYRANTA · Data Intelligence"]]} />
      <Select name="kind" text="Type" options={[["website", "Website"], ["web_app", "Web app"], ["mobile_app", "Mobile app"], ["system", "System"], ["data", "Data project"]]} />
      <Field name="url" text="URL" placeholder="example.com" />
      <Field name="stack" text="Built with" placeholder="WordPress, Next.js…" />
      <Field name="support_ends_on" text="Included support ends" type="date" />
      <Select name="hosting_owner" text="Hosting managed by" options={[["client", "The client"], ["razzo", "Us"]]} />
      <Field name="hosting_provider" text="Hosting provider" placeholder="GoDaddy, Vercel…" />
      <Select name="code_owner" text="Code kept by" options={[["client", "The client"], ["razzo", "Us"]]} />
    </div>
  );
}

export function NewClientForm() {
  const [state, action, pending] = useActionState(createClientAccount, undefined);
  if (state?.ok && state.link) return <InviteLink link={state.link} email={state.email!} />;
  return (
    <form action={action} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="mb-2 font-semibold">Company</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="org_name" text="Company name" required maxLength={120} />
          <Field name="industry" text="Industry" />
          <Field name="city" text="City" />
          <Select name="timezone" text="Time zone" options={zones} />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-2 font-semibold">First project</legend>
        <ProjectFields />
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-2 font-semibold">Main contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="full_name" text="Name" required maxLength={120} />
          <Field name="email" text="Email" type="email" required />
        </div>
        <p className="text-xs text-muted">They choose their own password from the invitation link. We never set or see it.</p>
      </fieldset>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={submit}>{pending ? "Creating…" : "Create client and invitation"}</button>
    </form>
  );
}

export function InviteForm({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState(inviteMember, undefined);
  return (
    <div className="space-y-3">
      {state?.ok && state.link && <InviteLink link={state.link} email={state.email!} />}
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <input type="hidden" name="organization_id" value={orgId} />
        <Field name="full_name" text="Name" maxLength={120} />
        <Field name="email" text="Email" type="email" required />
        <Select name="role" text="Role" options={[["client_owner", "Owner"], ["client_member", "Member"]]} />
        <button type="submit" disabled={pending} className={`${submit} h-10 py-0`}>{pending ? "…" : "Invite / new link"}</button>
      </form>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
    </div>
  );
}

export function ProjectForm({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState(addProject, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="organization_id" value={orgId} />
      <ProjectFields />
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-success">Project added.</p>}
      <button type="submit" disabled={pending} className={submit}>{pending ? "Adding…" : "Add project"}</button>
    </form>
  );
}

export function EventForm({ orgs }: { orgs: { id: string; name: string; timezone: string }[] }) {
  const [state, action, pending] = useActionState(addEvent, undefined);
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const tz = orgs.find((o) => o.id === orgId)?.timezone ?? "America/Mexico_City";
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="timezone" value={tz} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={label}>
          <span className="font-medium">Client</span>
          <select name="organization_id" value={orgId} onChange={(e) => setOrgId(e.target.value)} className={input}>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
        <Select name="type" text="Type" options={[["call", "Call"], ["milestone", "Milestone"], ["delivery", "Delivery"], ["payment", "Payment"], ["coverage", "Support"], ["renewal", "Renewal"]]} />
        <Field name="title" text="Title" required maxLength={140} placeholder="Weekly check-in" />
        <Field name="location" text="Where" placeholder="Google Meet link" />
        <Field name="date" text="Date" type="date" required />
        <Field name="time" text={`Time (${tz.split("/")[1]?.replace("_", " ")})`} type="time" />
        <Field name="minutes" text="Minutes" type="number" min={5} max={480} defaultValue={30} />
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" name="staff_only" className="h-4 w-4 accent-[#25231F]" /> Only staff can see it
        </label>
      </div>
      <p className="text-xs text-muted">Leave the time empty for an all-day date. The client sees it in their own calendar.</p>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-success">Added to the calendar.</p>}
      <button type="submit" disabled={pending} className={submit}>{pending ? "Saving…" : "Add to calendar"}</button>
    </form>
  );
}

export function MoveTicketForm({ id, steps, coverage }: { id: string; steps: TicketStatus[]; coverage: Coverage }) {
  const [state, action, pending] = useActionState(moveTicket, undefined);
  if (!steps.length) return <p className="text-sm text-muted">This request is closed.</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ticket_id" value={id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="to" text="Move to" options={steps.map((s) => [s, clientLabel[s]])} />
        <Select
          name="coverage"
          text="Coverage"
          defaultValue={coverage}
          options={[["to_assess", "To assess"], ["included", "Included support"], ["plan", "Monthly plan"], ["warranty", "Warranty"], ["pay_per_incident", "Pay per incident"]]}
        />
      </div>
      <label className={label}>
        <span className="font-medium">Internal note</span>
        <textarea name="note" rows={3} maxLength={2000} className={`${input} h-auto py-2`} placeholder="Why, effort estimate, next step… (clients don't see it)" />
      </label>
      <p className="text-xs text-muted">
        Pay-per-incident work can only start after a confirmed payment. Covered work (included, plan, warranty) can start
        straight from assessment.
      </p>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-success">Updated. The client was notified.</p>}
      <button type="submit" disabled={pending} className={submit}>{pending ? "Saving…" : "Update request"}</button>
    </form>
  );
}
