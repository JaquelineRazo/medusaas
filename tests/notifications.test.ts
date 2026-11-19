import { afterEach, describe, expect, it } from "vitest";
import { listNotices, markAllRead, notifyOrgMembers, notifyStaff } from "@/lib/notifications";
import { admin, clientAs, fixtures, localSupabase } from "./support/local-supabase";

describe.skipIf(!localSupabase)("notifications", () => {
  const fx = fixtures();
  afterEach(() => fx.cleanup());

  it("staff notify every member of an organization, and only them", async () => {
    const [org, other] = [await fx.org(), await fx.org()];
    const [owner, member, outsider] = [await fx.client(org), await fx.client(org, "client_member"), await fx.client(other)];
    const staff = await fx.staff();

    await notifyOrgMembers(clientAs(staff, "aal2"), org, "MS-1 is now: In progress.", "/app/requests/x");

    for (const id of [owner, member]) {
      const notices = await listNotices(clientAs(id), { tz: "America/Mexico_City" });
      expect(notices.map((n) => n.text)).toEqual(["MS-1 is now: In progress."]);
    }
    expect(await listNotices(clientAs(outsider), { tz: "America/Mexico_City" })).toEqual([]);
  });

  it("clients can reach staff only through notifyStaff", async () => {
    const org = await fx.org();
    const client = await fx.client(org);
    const staff = await fx.staff();

    const direct = await clientAs(client).from("notifications").insert({ user_id: staff, text: "Hi" });
    expect(direct.error).not.toBeNull();

    await notifyStaff("New request MS-2 from Test org: Footer", "/console/tickets/x");
    const notices = await listNotices(clientAs(staff, "aal2"), { tz: "America/Mexico_City" });
    expect(notices.map((n) => n.text)).toContain("New request MS-2 from Test org: Footer");
  });

  it("lists newest first, with a unique id per notice even when texts repeat", async () => {
    const org = await fx.org();
    const client = await fx.client(org);
    const staff = clientAs(await fx.staff(), "aal2");

    await notifyOrgMembers(staff, org, "MS-3 is now: In progress.", "/app/requests/x");
    await notifyOrgMembers(staff, org, "MS-3 is now: Ready for your review.", "/app/requests/x");
    await notifyOrgMembers(staff, org, "MS-3 is now: In progress.", "/app/requests/x");

    const notices = await listNotices(clientAs(client), { tz: "America/Mexico_City" });
    expect(notices.map((n) => n.text)).toEqual([
      "MS-3 is now: In progress.",
      "MS-3 is now: Ready for your review.",
      "MS-3 is now: In progress.",
    ]);
    expect(new Set(notices.map((n) => n.id)).size).toBe(3);
    expect(notices.every((n) => n.unread && n.link === "/app/requests/x")).toBe(true);
    expect(await listNotices(clientAs(client), { tz: "America/Mexico_City", limit: 2 })).toHaveLength(2);
  });

  it("shows the time in the viewer's time zone", async () => {
    const org = await fx.org();
    const client = await fx.client(org);
    const { data } = await admin()
      .from("notifications")
      .insert({ user_id: client, text: "Hello", created_at: "2026-03-10T18:30:00Z" })
      .select("id")
      .single();

    const [mx] = await listNotices(clientAs(client), { tz: "America/Mexico_City" });
    const [ny] = await listNotices(clientAs(client), { tz: "America/New_York" });
    expect(mx).toMatchObject({ id: data!.id, when: "Mar 10, 12:30 PM" });
    expect(ny.when).toBe("Mar 10, 2:30 PM");
  });

  it("marks only the viewer's own notices as read", async () => {
    const org = await fx.org();
    const [a, b] = [await fx.client(org), await fx.client(org)];
    await notifyOrgMembers(clientAs(await fx.staff(), "aal2"), org, "MS-4 is now: Completed.", "/app/requests/x");

    await markAllRead(clientAs(a));

    expect((await listNotices(clientAs(a), { tz: "UTC" })).map((n) => n.unread)).toEqual([false]);
    expect((await listNotices(clientAs(b), { tz: "UTC" })).map((n) => n.unread)).toEqual([true]);
  });

  it("trims text to what the database accepts instead of dropping the notice", async () => {
    const org = await fx.org();
    const client = await fx.client(org);
    await notifyOrgMembers(clientAs(await fx.staff(), "aal2"), org, "x".repeat(400), "/app/requests/x");
    const [n] = await listNotices(clientAs(client), { tz: "UTC" });
    expect(n.text).toHaveLength(300);
  });
});
