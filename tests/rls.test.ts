// Row Level Security tests against the real Supabase database (BRIEF.md US-07).
// Each test runs inside a transaction that is rolled back, so nothing is left behind.
// Needs SUPABASE_DB_PASSWORD and SUPABASE_DB_HOST (from .env.local); skipped otherwise.
import { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const REF = "abdjjuugxomhdrwpylhl";
const { SUPABASE_DB_PASSWORD: pw, SUPABASE_DB_HOST: host } = process.env;

const ids = {
  orgA: "00000000-0000-4000-a000-00000000000a",
  orgB: "00000000-0000-4000-a000-00000000000b",
  clientA: "00000000-0000-4000-b000-00000000000a",
  clientB: "00000000-0000-4000-b000-00000000000b",
  staff: "00000000-0000-4000-c000-000000000001",
  projA: "00000000-0000-4000-d000-00000000000a",
  projB: "00000000-0000-4000-d000-00000000000b",
  ticketA: "00000000-0000-4000-e000-00000000000a",
  ticketB: "00000000-0000-4000-e000-00000000000b",
};

describe.skipIf(!pw || !host)("row level security", () => {
  const db = new Client({
    connectionString: `postgresql://postgres.${REF}:${encodeURIComponent(pw ?? "")}@${host}:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });

  async function as(user: string | null, aal: "aal1" | "aal2" = "aal1") {
    await db.query("reset role");
    if (user === null) {
      await db.query("set local role anon");
      return;
    }
    await db.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: user, role: "authenticated", aal }),
    ]);
    await db.query("set local role authenticated");
  }

  const count = async (sql: string, params: unknown[] = []) => Number((await db.query(sql, params)).rows.length);

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  beforeEach(async () => {
    await db.query("begin");
    for (const [id, email] of [
      [ids.clientA, "a@test.invalid"],
      [ids.clientB, "b@test.invalid"],
      [ids.staff, "staff@test.invalid"],
    ])
      await db.query("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [id, email]);
    await db.query("insert into public.organizations (id, name) values ($1, 'Org A'), ($2, 'Org B')", [ids.orgA, ids.orgB]);
    await db.query("insert into public.memberships (organization_id, user_id) values ($1, $2), ($3, $4)", [
      ids.orgA, ids.clientA, ids.orgB, ids.clientB,
    ]);
    await db.query("insert into public.staff (user_id, role) values ($1, 'superadmin')", [ids.staff]);
    await db.query(
      `insert into public.projects (id, organization_id, name, venture, kind, hosting_owner, code_owner)
       values ($1, $2, 'Site A', 'ORNIVA', 'website', 'client', 'client'), ($3, $4, 'App B', 'VARKORA', 'web_app', 'razzo', 'razzo')`,
      [ids.projA, ids.orgA, ids.projB, ids.orgB],
    );
    await db.query(
      `insert into public.tickets (id, organization_id, project_id, title, status, coverage)
       values ($1, $2, $3, 'Ticket A', 'evaluating', 'to_assess'), ($4, $5, $6, 'Ticket B', 'awaiting_payment', 'pay_per_incident')`,
      [ids.ticketA, ids.orgA, ids.projA, ids.ticketB, ids.orgB, ids.projB],
    );
    await db.query(
      `insert into public.calendar_events (organization_id, type, title, starts_at, staff_only)
       values ($1, 'call', 'Check-in', now(), false), ($1, 'renewal', 'SSL renewal', now(), true)`,
      [ids.orgA],
    );
  });

  afterEach(() => db.query("rollback"));

  it("a client only sees their own organization, projects and tickets", async () => {
    await as(ids.clientA);
    expect((await db.query("select name from organizations")).rows).toEqual([{ name: "Org A" }]);
    expect((await db.query("select name from projects")).rows).toEqual([{ name: "Site A" }]);
    expect(await count("select 1 from tickets where id = $1", [ids.ticketB])).toBe(0);
    expect(await count("select 1 from ticket_events te join tickets t on t.id = te.ticket_id where t.organization_id = $1", [ids.orgB])).toBe(0);
  });

  it("a client can open a ticket only in their org, only as new", async () => {
    await as(ids.clientA);
    await db.query("savepoint s");
    await expect(
      db.query("insert into tickets (organization_id, title, created_by) values ($1, 'Hack', $2)", [ids.orgB, ids.clientA]),
    ).rejects.toThrow(/row-level security/);
    await db.query("rollback to savepoint s");
    await expect(
      db.query("insert into tickets (organization_id, title, created_by, status) values ($1, 'Skip', $2, 'in_progress')", [ids.orgA, ids.clientA]),
    ).rejects.toThrow(/row-level security/);
    await db.query("rollback to savepoint s");
    await expect(
      db.query("insert into tickets (organization_id, project_id, title, created_by) values ($1, $2, 'Cross project', $3)", [ids.orgA, ids.projB, ids.clientA]),
    ).rejects.toThrow(/row-level security/);
    await db.query("rollback to savepoint s");
    const ok = await db.query("insert into tickets (organization_id, project_id, title, created_by) values ($1, $2, 'Fix footer', $3) returning status", [
      ids.orgA, ids.projA, ids.clientA,
    ]);
    expect(ok.rows[0].status).toBe("new");
  });

  it("a client can't change status directly or through the transition function", async () => {
    await as(ids.clientA);
    await db.query("savepoint s");
    await expect(db.query("update tickets set status = 'completed' where id = $1", [ids.ticketA])).rejects.toThrow(/permission denied/);
    await db.query("rollback to savepoint s");
    await expect(db.query("select transition_ticket($1, 'in_progress', null, 'included')", [ids.ticketA])).rejects.toThrow(/Only staff/);
  });

  it("hides staff-only calendar events from clients", async () => {
    await as(ids.clientA);
    expect((await db.query("select title from calendar_events")).rows).toEqual([{ title: "Check-in" }]);
  });

  it("staff need MFA (aal2) to see client data", async () => {
    await as(ids.staff, "aal1");
    expect(await count("select 1 from organizations")).toBe(0);
    await as(ids.staff, "aal2");
    expect(await count("select 1 from organizations")).toBe(2);
    expect(await count("select 1 from tickets")).toBe(2);
  });

  it("enforces the payment gate in the database", async () => {
    await as(ids.staff, "aal2");
    await db.query("savepoint s");
    await expect(db.query("select transition_ticket($1, 'in_progress', null, 'pay_per_incident')", [ids.ticketA])).rejects.toThrow(/covered work/);
    await db.query("rollback to savepoint s");
    await expect(db.query("select transition_ticket($1, 'in_progress')", [ids.ticketB])).rejects.toThrow(/payment webhook/);
    await db.query("rollback to savepoint s");
    await expect(db.query("select transition_ticket($1, 'completed')", [ids.ticketA])).rejects.toThrow(/not allowed/);
    await db.query("rollback to savepoint s");
    const ok = await db.query("select (transition_ticket($1, 'in_progress', 'Covered by included support', 'included')).status", [ids.ticketA]);
    expect(ok.rows[0].status).toBe("in_progress");
    const history = await db.query("select from_status, to_status from ticket_events where ticket_id = $1 order by id", [ids.ticketA]);
    expect(history.rows.at(-1)).toEqual({ from_status: "evaluating", to_status: "in_progress" });
  });

  it("anonymous visitors can't read anything", async () => {
    await as(null);
    await expect(db.query("select 1 from organizations")).rejects.toThrow(/permission denied/);
  });
});
