# meduSAAS

Conversational support and operations for the clients of every venture: clients ask for help in the Client Portal, staff assess and deliver it in the Admin Workspace. UI wording follows the glossary in `razzo-strategy/06_medusaas/COPY.md`; this file names the concepts.

## People and places

**Client**:
A person with an account who belongs to at least one Organization and works in the Client Portal.
_Avoid_: customer, user (for this role)

**Organization**:
The company a Client belongs to; projects, tickets and calendar events always belong to one.
_Avoid_: account, company (in code), tenant

**Primary organization**:
The Organization a Client joined first; it sets the Client's time zone and receives requests that name no project.
_Avoid_: default org, first org

**Staff**:
A member of our team who works in the Admin Workspace, always after a second factor.
_Avoid_: admin (for the person), agent

**Client Portal**:
Where Clients follow their projects and open requests (`/app`).
_Avoid_: dashboard, client app

**Admin Workspace**:
Where Staff assess, quote and deliver work (`/console`).
_Avoid_: admin panel, backoffice

**Client context**:
What every Client Portal page knows about the viewer: their Organizations, Primary organization and time zone.

**Access decision**:
The single rule for where a person may be, given whether they are signed in, are Staff and have passed the second factor.
_Avoid_: auth guard, route protection

## Support work

**Request**:
What a Client asks for in a conversation, in their own words. Once sent from the Client Portal it is tracked as a Ticket; the Client keeps calling it a request.
_Avoid_: issue, case

**Ticket**:
A tracked Request with a code (`MS-1042`), a status and a Coverage.
_Avoid_: case, job

**Request kind**:
What the Client says they need: an issue, a change, something new or a question.
_Avoid_: category, type

**Ticket lifecycle**:
The statuses a Ticket moves through, from received to completed or cancelled, and the rules for each move.
_Avoid_: workflow, pipeline

**Assessment**:
Our evaluation of a Ticket's scope, effort and cost, before work starts.
_Avoid_: diagnosis, triage

**Quote**:
A versioned price and scope the Client approves before paid work starts.
_Avoid_: budget, estimate (as a noun)

**Coverage**:
Who pays for a Ticket's work: still to assess, Included support, Monthly plan, Warranty, or Pay per incident.
_Avoid_: billing type, plan type

**Covered work**:
Work whose Coverage is Included support, Monthly plan or Warranty; it may start straight from Assessment.

**Included support**:
The free support period after a project is delivered.
_Avoid_: warranty (in the UI)

**Warranty**:
Coverage for fixing defects in work we delivered. Shown to Staff only.

**Monthly plan**:
A recurring card subscription that covers support work.
_Avoid_: retainer, subscription (in the UI)

**Pay per incident**:
One-off work paid against an approved Quote.
_Avoid_: billable, ad hoc

**Payment gate**:
The rule that pay-per-incident work never starts until the payment is verified; only the payment confirmation can move it from awaiting payment to in progress.
_Avoid_: paywall, payment lock

## Communication

**Notice**:
A short message telling a person something changed, with a link to it; shown in the bell and the notifications page, and also sent by email.
_Avoid_: alert, notification (for a single item)
