// The ticket state machine lives in TypeScript (for the UI) and in SQL (the final word).
// This fails the moment the two disagree. Runs against local Supabase (`npx supabase start`).
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isTransition, ticketStatuses } from "@/lib/ticket-machine";
import { localSupabase } from "./support/local-supabase";

const DB_URL = process.env.SUPABASE_TEST_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

describe.skipIf(!localSupabase)("ticket transitions: TypeScript and SQL agree", () => {
  const db = new Client({ connectionString: DB_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  it("has the same statuses", async () => {
    const { rows } = await db.query("select unnest(enum_range(null::public.ticket_status))::text as s");
    expect(rows.map((r) => r.s).sort()).toEqual([...ticketStatuses].sort());
  });

  it("allows exactly the same transitions", async () => {
    const { rows } = await db.query(
      `select f::text as "from", t::text as "to", public.ticket_transition_allowed(f, t) as ok
         from unnest(enum_range(null::public.ticket_status)) f, unnest(enum_range(null::public.ticket_status)) t`,
    );
    expect(rows).toHaveLength(ticketStatuses.length ** 2);
    const disagree = rows.filter((r) => r.ok !== isTransition(r.from, r.to));
    expect(disagree).toEqual([]);
  });
});
