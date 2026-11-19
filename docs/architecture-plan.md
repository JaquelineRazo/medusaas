# Architecture plan: Ticket lifecycle, Notifications, Access decision, Client context

Source: architecture review of 2026-11-19 (improve-codebase-architecture). Vocabulary: module, interface, seam, adapter, depth, leverage, locality (see the codebase-design skill) and GLOSSARY.md for the domain.

## Problem Statement

**Founder / staff**
- The ticket state machine lives twice (TypeScript and SQL), held in sync only by a comment. It guards the rule that no billable work starts without a verified payment.
- The console hardcodes which steps it offers from `evaluating`.
- Notifications are never marked read: the bell count only grows.
- Notices with the same text collide in the bell (`key={n.text}`).

**Client**
- The time zone is chosen page by page, with inconsistent fallbacks.
- With several organizations, the first one in alphabetical order wins by accident.

**Maintainer (person or agent)**
- Understanding one concept means reading 3–5 files.
- "Who goes where" (portal, console, MFA) is encoded in three places.
- Phase 3 (Stripe webhook) has no clear place to plug in.

## Solution

Four deep modules with small interfaces:

1. **Ticket lifecycle**: open requests, move status, compute allowed steps, notify the right people.
2. **Notifications**: list, send, mark as read.
3. **Access decision**: a pure function that says where each person goes given their session.
4. **Client context**: `requireClient()` returns the time zone and primary organization already resolved.

Server actions and pages only read the form or URL, call the module and render. No UI copy changes.

## User Stories

**Client**
1. As a client, I want to open a request from the conversation and get its `MS-n` code, so that I can follow it up.
2. As a client, I want my request to be linkable only to my organization's projects, so that my data never mixes with others'.
3. As a client, I want an "Issue" request to get high priority automatically, so that urgent problems are seen first.
4. As a client, I want a notice when my request changes status, so that I don't have to keep checking.
5. As a client, I want that notice to use the client-facing status labels from COPY.md, so that I understand it without jargon.
6. As a client, I want the bell to stop counting notices I already saw, so that I can tell what is new.
7. As a client, I want two notices with the same text to show as two, so that I don't miss one.
8. As a client, I want every date and time in my organization's time zone, on every page.
9. As a client with several organizations, I want a fixed rule for my primary organization, so that dates and notices don't change at random.
10. As a client, I want `/console` to send me back to `/app`, so that I never see screens that aren't mine.
11. As a signed-out client, I want sign-in to return me to the page I was opening.

**Staff / founder**
12. As staff, I want the console to offer only valid next statuses, so that I don't attempt impossible moves.
13. As staff, I want "In progress" offered from `evaluating` together with the coverage choice, and refused with the usual message when the coverage doesn't allow it.
14. As staff, I never want `awaiting_payment → in_progress` offered, because only the payment webhook does that.
15. As staff, I want every status change to keep writing history and audit logs, as today.
16. As staff, I want everyone in the client's organization notified when I move a ticket.
17. As staff, I want a notice when a client opens a request.
18. As staff, I want my notices marked read when I open the notifications page.
19. As staff without MFA, I want any `/console` route to take me to `/console/mfa`.
20. As staff, I want `/app` to send me to `/console`.
21. As staff, I want sign-in and set-password to take me to MFA.
22. As staff, I want a missing time zone to fall back to the Mexico City default defined in one place.

**Maintainer**
23. As a maintainer, I want the suite to fail if the TypeScript and SQL transitions drift apart.
24. As a maintainer, I want to test the ticket lifecycle only through its interface, against the real database, with no mocks.
25. As a maintainer, I want to test the access decision with no network or database, covering every combination of session, staff, MFA and path.
26. As a maintainer, I want Phase 3 to add payment confirmation inside the ticket lifecycle module without touching the actions.
27. As a maintainer, I want a GLOSSARY.md with the domain terms, so that people and agents use the same names.
28. As a maintainer, I want one set of form-reading helpers (text, optional, email), so that validation doesn't vary between actions.

## Implementation Decisions

**Ticket lifecycle module** (new, server-only; absorbs the logic in the actions)
- Interface:
  - `openRequest(db, client, input)` with `client = { userId, orgs }` and `input = { kind, projectId, details }` → `{ id, code }` or `{ error }`.
  - `moveTicket(db, { ticketId, to, note?, coverage? })` → `{ ok }` or `{ error }`.
  - `staffNextSteps(status)`.
  - Display vocabulary: `TicketStatus`, `Coverage`, `clientLabel`, `ticketCode`.
- `db` is the acting person's Supabase client, so RLS always applies.
- The module does not call `revalidatePath` or read `FormData`; the actions do.
- `staffNextSteps` replaces the hardcoded list in the page:
  - From `evaluating` it includes `in_progress`, because coverage is chosen in the same form.
  - It never includes `awaiting_payment → in_progress`.
  - `moveTicket` validates coverage before calling `transition_ticket`; the database keeps the final word.
- The TypeScript transition table stays, only for the UI and error messages, watched by the drift test.
- Current error messages stay the same.
- Notices go out through the Notifications module.

**Notifications module** (new)
- Interface: `listNotices(db, { tz, limit })`, `notifyOrgMembers(db, orgId, text, link)`, `notifyStaff(text, link)`, `markAllRead(db)`.
- `listNotices` returns each notice's `id`, which becomes the `key` in the bell and `NotificationCenter`.
- `notifyStaff` uses the admin client internally (clients can't write notifications); callers stop making that choice.
- **New behavior:** opening the notifications page (portal or console) marks everything read. No new copy needed; the database already grants `update (read_at)`.
- The two layouts and two notification pages stop querying on their own.

**Access decision** (new, pure)
- `destinationFor({ signedIn, isStaff, aal, path })` → `"allow"` or a redirect path.
- Used by the middleware, `requireStaff`, `signIn`, `setPassword` and the MFA page.
- Callers only read the session and obey the result.
- "Is staff" is always read the same way, through `staff_pending_mfa`.
- `safeNext` stays as is and is applied to the result.

**Client context**
- `requireClient()` also returns `primaryOrg` and `tz`.
- Primary organization: the oldest membership (replaces the accidental alphabetical order).
- `tz` is the primary organization's, or `DEFAULT_TZ`.
- Replace every `orgs[0]?.timezone`.
- Replace loose `"America/Mexico_City"` literals with `DEFAULT_TZ` (client-side `forms.tsx` imports it from `format.ts`, which has no server-only code).

**Form reading**
- A small module with `str`, `opt`, `isEmail`, used by every action.
- Done while slimming the actions, not as separate work.

**Schema:** no changes.

**GLOSSARY.md** (new, repo root): Ticket/Request (same concept; "request" is the client's word), Ticket lifecycle, Coverage, Payment gate, Notice, Access decision, Client context, Primary organization.

## Testing Decisions

**What makes a good test:** it goes only through the module's interface and asserts observable outcomes: database state, history, notices created, the returned path. Internal refactors must not force test changes.

**Ticket lifecycle and Notifications**
- Run against **local Supabase** (`supabase start`, same migrations).
- `db` is a Supabase client carrying a JWT signed with the local secret, with the test user's `sub` and `aal`. Same pattern as `as(user, aal)` in rls.test, without enrolling real MFA.
- Fixtures get random IDs via the admin client and are deleted after each test (PostgREST can't wrap a transaction).
- Cases: own org vs. someone else's project; priority by kind; staff notices; every payment-gate rule; member notices with their label; history written.
- Skipped automatically when local Supabase isn't running, like rls.test.

**Drift test:** walks the 64 status pairs, calls `ticket_transition_allowed` and compares with the TypeScript table.

**Access decision:** in-process vitest table: signed out, client, staff with and without MFA, on `/app`, `/console`, `/console/mfa` and public paths.

**Client context:** covered inside the notification tests (times come out in the right zone); no test of its own.

**Deleted:** ticket-machine.test.ts (the module tests cover it). **Kept:** rls.test.ts (it tests database policies).

**Prior art:** rls.test.ts (switching user by JWT, payment-gate cases) and ticket-machine.test.ts (the rules to preserve).

## Out of Scope

- Stripe webhook and payment confirmation (Phase 3); only its place in the ticket lifecycle module is prepared.
- Emailing notices.
- Per-topic notification preferences (`NotificationCenter` topics stay visual).
- Marking notices read one by one.
- Switching organizations for multi-org clients.
- Moving rls.test.ts to local Supabase.
- Demo screens that use `mock.ts`.

## Further Notes

- The CLAUDE.md rule (nothing billable without a verified payment webhook) stays enforced by the database; the module only mirrors it.
- No UI copy changes. If any is ever needed, add it to COPY.md first.

---

# Implementation plan

Each phase leaves `npm test`, `npm run lint` and `npm run build` green and lands in its own commit.

**F0 · Test infrastructure**
1. Run `supabase start` locally on the existing `supabase/config.toml`.
2. Test helper: `clientAs(userId, aal)` (signed JWT → Supabase client), `admin()`, fixtures (organization, client, staff, project, ticket) and cleanup.
3. Drift test TS ↔ SQL; it must pass today.
4. `test:db` script and README notes on how to run it.

*Done when:* the drift test passes locally and is skipped when local Supabase isn't running.

**F1 · Notifications module**
1. Tests for `listNotices`, `notifyOrgMembers`, `notifyStaff`, `markAllRead` (red).
2. Implement the module.
3. Two layouts and two pages use it; the pages call `markAllRead`.
4. `id` on `Notice`, used as `key` in the bell and `NotificationCenter`.

*Done when:* no query on `notifications` exists outside the module.

**F2 · Ticket lifecycle and form reading**
1. Tests for `openRequest` and `moveTicket` (red), with the cases above.
2. Implement the module; it absorbs ticket-machine.ts and uses Notifications.
3. Form-reading module (`str`, `opt`, `isEmail`).
4. Slim `moveTicket` and `createRequest` to: read the form, call the module, `revalidatePath`.
5. The console ticket page uses `staffNextSteps`.
6. Delete ticket-machine.test.ts.

*Done when:* no action calls `transition_ticket` or inserts into `tickets` directly.

**F3 · Access decision**
1. Table test for `destinationFor` (red).
2. Implement it.
3. Wire it into the middleware, `requireStaff`, `signIn`, `setPassword` and the MFA page.
4. Check the five journeys by hand: signed out, client, staff without MFA, staff with MFA, invitation link.

*Done when:* the redirect decision exists in exactly one place.

**F4 · Client context**
1. `requireClient()` returns `primaryOrg` (oldest membership) and `tz`.
2. Replace every `orgs[0]` and loose time-zone literal.
3. `createRequest` uses `primaryOrg` when there is no project.

*Done when:* `grep "orgs\[0\]"` returns nothing.

**F5 · Glossary**
1. Create GLOSSARY.md with the terms above.
2. Link it from CLAUDE.md.
