import { describe, expect, it } from "vitest";
import { destinationFor, landingFor, type Session } from "@/lib/access";

const out: Session = { signedIn: false, isStaff: false, aal: null };
const client: Session = { signedIn: true, isStaff: false, aal: "aal1" };
const staffNoMfa: Session = { signedIn: true, isStaff: true, aal: "aal1" };
const staff: Session = { signedIn: true, isStaff: true, aal: "aal2" };

describe("destinationFor", () => {
  it.each([
    // who,          path,                   where they end up
    ["signed out", out, "/app", "/sign-in?next=%2Fapp"],
    ["signed out", out, "/app/requests/1?tab=x", "/sign-in?next=%2Fapp%2Frequests%2F1%3Ftab%3Dx"],
    ["signed out", out, "/console", "/sign-in"],
    ["signed out", out, "/console/mfa", "/sign-in"],
    ["client", client, "/app", "allow"],
    ["client", client, "/app/billing", "allow"],
    ["client", client, "/console", "/app"],
    ["client", client, "/console/tickets/1", "/app"],
    ["client", client, "/console/mfa", "/app"],
    ["staff without MFA", staffNoMfa, "/app", "/console"],
    ["staff without MFA", staffNoMfa, "/console", "/console/mfa"],
    ["staff without MFA", staffNoMfa, "/console/clients", "/console/mfa"],
    ["staff without MFA", staffNoMfa, "/console/mfa", "allow"],
    ["staff", staff, "/app/requests", "/console"],
    ["staff", staff, "/console", "allow"],
    ["staff", staff, "/console/tickets/1", "allow"],
    ["staff", staff, "/console/mfa", "allow"],
  ] as const)("%s at %s", (_who, session, path, expected) => {
    expect(destinationFor(session, path)).toBe(expected);
  });

  it("leaves public pages and look-alike paths alone", () => {
    for (const path of ["/", "/talk", "/sign-in", "/set-password", "/application", "/consoles"])
      for (const s of [out, client, staffNoMfa, staff]) expect(destinationFor(s, path)).toBe("allow");
  });
});

describe("landingFor (after sign-in or choosing a password)", () => {
  it("sends staff to the second factor, whatever `next` says", () => {
    expect(landingFor(staffNoMfa, null)).toBe("/console/mfa");
    expect(landingFor(staffNoMfa, "/app/requests")).toBe("/console/mfa");
    expect(landingFor(staffNoMfa, "/console/tickets/1")).toBe("/console/mfa");
  });

  it("returns clients to the page they were opening, inside the portal only", () => {
    expect(landingFor(client, "/app/requests/1")).toBe("/app/requests/1");
    expect(landingFor(client, null)).toBe("/app");
    expect(landingFor(client, "/console/clients")).toBe("/app");
  });

  it("never becomes an open redirect", () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"])
      expect(landingFor(client, next)).toBe("/app");
  });
});
