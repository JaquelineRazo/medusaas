// Proves the local harness acts as real users: RLS and MFA apply through clientAs().
import { afterEach, describe, expect, it } from "vitest";
import { clientAs, fixtures, localSupabase } from "./support/local-supabase";

describe.skipIf(!localSupabase)("local Supabase harness", () => {
  const fx = fixtures();
  afterEach(() => fx.cleanup());

  it("a client sees only their organization; staff need aal2", async () => {
    const [a, b] = [await fx.org("Org A"), await fx.org("Org B")];
    const client = await fx.client(a);
    const staff = await fx.staff();

    const { data: seen } = await clientAs(client).from("organizations").select("id").in("id", [a, b]);
    expect(seen).toEqual([{ id: a }]);

    const { data: noMfa } = await clientAs(staff, "aal1").from("organizations").select("id").in("id", [a, b]);
    expect(noMfa).toEqual([]);
    const { data: withMfa } = await clientAs(staff, "aal2").from("organizations").select("id").in("id", [a, b]);
    expect(withMfa).toHaveLength(2);
  });
});
