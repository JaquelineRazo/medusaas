import { afterEach, describe, expect, it } from "vitest";
import { clientContext } from "@/lib/auth";
import { admin, clientAs, fixtures, localSupabase } from "./support/local-supabase";

describe.skipIf(!localSupabase)("client context", () => {
  const fx = fixtures();
  afterEach(() => fx.cleanup());

  it("uses the oldest membership as primary organization and its time zone", async () => {
    const zeta = await fx.org("Zeta", "America/Los_Angeles");
    const acme = await fx.org("Acme", "America/New_York");
    const userId = await fx.client(zeta);
    await admin().from("memberships").insert({ organization_id: acme, user_id: userId });

    const ctx = await clientContext(clientAs(userId), userId);

    expect(ctx.orgs.map((o) => o.name)).toEqual(["Acme", "Zeta"]);
    expect(ctx.primaryOrg?.name).toBe("Zeta");
    expect(ctx.tz).toBe("America/Los_Angeles");
    expect(ctx.profile?.full_name).toBe("Test client");
  });

  it("falls back to Mexico City when the account has no organization yet", async () => {
    const userId = await fx.user();
    const ctx = await clientContext(clientAs(userId), userId);
    expect(ctx).toMatchObject({ orgs: [], primaryOrg: null, tz: "America/Mexico_City" });
  });
});
