import { afterEach, describe, expect, it } from "vitest";
import { staffNextSteps } from "@/lib/ticket-machine";
import { moveTicket, openRequest } from "@/lib/tickets";
import { admin, clientAs, fixtures, localSupabase } from "./support/local-supabase";

describe("steps offered to staff", () => {
  it("offers In progress from assessment, since coverage is chosen in the same form", () => {
    expect(staffNextSteps("evaluating")).toEqual(["quote_ready", "in_progress", "cancelled"]);
  });

  it("never offers the move reserved for the payment webhook", () => {
    expect(staffNextSteps("awaiting_payment")).toEqual(["cancelled"]);
  });

  it("offers nothing once a request is closed", () => {
    expect(staffNextSteps("completed")).toEqual([]);
    expect(staffNextSteps("cancelled")).toEqual([]);
  });
});

describe.skipIf(!localSupabase)("ticket lifecycle", () => {
  const fx = fixtures();
  afterEach(() => fx.cleanup());

  const history = async (ticketId: string) =>
    (await admin().from("ticket_events").select("from_status, to_status, note").eq("ticket_id", ticketId).order("id")).data;
  const noticesOf = async (userId: string) =>
    ((await admin().from("notifications").select("text, link").eq("user_id", userId)).data ?? []);

  async function clientSetup() {
    const org = await fx.org("Acme");
    const userId = await fx.client(org);
    return { org, userId, client: { userId, primaryOrg: { id: org, name: "Acme" } }, db: clientAs(userId) };
  }

  describe("openRequest", () => {
    it("opens a new request on the client's project and tells the team", async () => {
      const { org, client, db } = await clientSetup();
      const project = await fx.project(org);
      const staff = await fx.staff();

      const res = await openRequest(db, client, { kind: "issue", projectId: project, details: "The footer is broken\nOn mobile only" });

      if (!("id" in res)) throw new Error(res.error);
      expect(res.code).toMatch(/^MS-\d+$/);
      const { data: t } = await admin().from("tickets").select("*").eq("id", res.id).single();
      expect(t).toMatchObject({
        organization_id: org,
        project_id: project,
        title: "Issue: The footer is broken",
        description: "The footer is broken\nOn mobile only",
        status: "new",
        priority: "high",
        created_by: client.userId,
      });
      expect(await history(res.id)).toEqual([{ from_status: null, to_status: "new", note: "Request created" }]);
      expect(await noticesOf(staff)).toEqual([
        { text: `New request ${res.code} from Acme: The footer is broken`, link: `/console/tickets/${res.id}` },
      ]);
    });

    it("uses normal priority for anything that isn't an issue, and the client's organization without a project", async () => {
      const { org, client, db } = await clientSetup();
      const res = await openRequest(db, client, { kind: "question", projectId: null, details: "How do I add a page?" });
      if (!("id" in res)) throw new Error(res.error);
      const { data: t } = await admin().from("tickets").select("organization_id, project_id, priority, title").eq("id", res.id).single();
      expect(t).toEqual({ organization_id: org, project_id: null, priority: "normal", title: "Question: How do I add a page?" });
    });

    it("names the project's organization when telling the team", async () => {
      const { org: home, userId, db } = await clientSetup();
      const second = await fx.org("Beta Shop");
      await admin().from("memberships").insert({ organization_id: second, user_id: userId });
      const project = await fx.project(second);
      const staff = await fx.staff();
      const res = await openRequest(db, { userId, primaryOrg: { id: home, name: "Acme" } }, { kind: "change", projectId: project, details: "New banner" });
      if (!("id" in res)) throw new Error(res.error);
      const { data: t } = await admin().from("tickets").select("organization_id").eq("id", res.id).single();
      expect(t?.organization_id).toBe(second);
      expect((await noticesOf(staff))[0].text).toBe(`New request ${res.code} from Beta Shop: New banner`);
    });

    it("refuses a project from another organization", async () => {
      const { client, db } = await clientSetup();
      const foreign = await fx.project(await fx.org("Other"));
      expect(await openRequest(db, client, { kind: "change", projectId: foreign, details: "Change the logo" })).toEqual({
        error: "We couldn't find that project.",
      });
    });

    it("asks for more detail, a valid kind and a linked company", async () => {
      const { client, db } = await clientSetup();
      expect(await openRequest(db, client, { kind: "issue", projectId: null, details: "  hi " })).toEqual({
        error: "Tell us a little more so we can help.",
      });
      expect(await openRequest(db, client, { kind: "bogus" as never, projectId: null, details: "Something real" })).toEqual({
        error: "Choose what you need.",
      });
      expect(await openRequest(db, { ...client, primaryOrg: null }, { kind: "issue", projectId: null, details: "Something real" })).toEqual({
        error: "Your account isn't linked to a company yet.",
      });
    });
  });

  describe("moveTicket", () => {
    async function staffSetup(values: Parameters<typeof fx.ticket>[1] = {}) {
      const org = await fx.org();
      const member = await fx.client(org);
      const ticket = await fx.ticket(org, { status: "evaluating", ...values });
      return { org, member, ticket, db: clientAs(await fx.staff(), "aal2") };
    }

    it("starts covered work from assessment, records it and tells the client's people", async () => {
      const { member, ticket, db } = await staffSetup();

      expect(await moveTicket(db, { ticketId: ticket.id, to: "in_progress", coverage: "included", note: "Covered by support" })).toEqual({ ok: true });

      const { data: t } = await admin().from("tickets").select("status, coverage").eq("id", ticket.id).single();
      expect(t).toEqual({ status: "in_progress", coverage: "included" });
      expect((await history(ticket.id))?.at(-1)).toEqual({ from_status: "evaluating", to_status: "in_progress", note: "Covered by support" });
      expect(await noticesOf(member)).toEqual([{ text: `MS-${ticket.number} is now: In progress.`, link: `/app/requests/${ticket.id}` }]);
    });

    it("keeps the ticket's coverage when none is given", async () => {
      const { ticket, db } = await staffSetup({ coverage: "warranty" });
      expect(await moveTicket(db, { ticketId: ticket.id, to: "in_progress" })).toEqual({ ok: true });
    });

    it("never starts pay-per-incident work without a paid quote", async () => {
      const { member, ticket, db } = await staffSetup();
      for (const coverage of ["pay_per_incident", "to_assess"] as const)
        expect(await moveTicket(db, { ticketId: ticket.id, to: "in_progress", coverage })).toEqual({
          error: "Only covered work (included support, plan or warranty) can start without a paid quote.",
        });
      const { data: t } = await admin().from("tickets").select("status").eq("id", ticket.id).single();
      expect(t?.status).toBe("evaluating");
      expect(await noticesOf(member)).toEqual([]);
    });

    it("leaves awaiting_payment → in_progress to the payment webhook", async () => {
      const { ticket, db } = await staffSetup({ status: "awaiting_payment", coverage: "pay_per_incident" });
      expect(await moveTicket(db, { ticketId: ticket.id, to: "in_progress" })).toEqual({
        error: "Work starts automatically when the payment is confirmed.",
      });
    });

    it("refuses jumps that skip steps", async () => {
      const { ticket, db } = await staffSetup({ status: "new" });
      expect(await moveTicket(db, { ticketId: ticket.id, to: "completed" })).toEqual({ error: "A request can't go from new to completed." });
    });

    it("refuses clients, unknown tickets and staff without MFA", async () => {
      const { member, ticket } = await staffSetup({ coverage: "included" });
      const client = await moveTicket(clientAs(member), { ticketId: ticket.id, to: "quote_ready" });
      expect(client).toHaveProperty("error");
      expect(await moveTicket(clientAs(await fx.staff(), "aal1"), { ticketId: ticket.id, to: "quote_ready" })).toEqual({ error: "Ticket not found." });
      expect(await moveTicket(clientAs(await fx.staff(), "aal2"), { ticketId: crypto.randomUUID(), to: "quote_ready" })).toEqual({ error: "Ticket not found." });
      const { data: t } = await admin().from("tickets").select("status").eq("id", ticket.id).single();
      expect(t?.status).toBe("evaluating");
    });
  });
});
