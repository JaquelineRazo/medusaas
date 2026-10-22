import { describe, expect, it } from "vitest";
import { blockedReason, nextSteps } from "../src/lib/ticket-machine";

describe("ticket state machine", () => {
  it("never starts pay-per-incident work straight from assessment", () => {
    expect(blockedReason("evaluating", "in_progress", "pay_per_incident")).toMatch(/covered/);
    expect(blockedReason("evaluating", "in_progress", "to_assess")).toMatch(/covered/);
  });

  it("lets covered work start after assessment", () => {
    for (const c of ["included", "plan", "warranty"] as const)
      expect(blockedReason("evaluating", "in_progress", c)).toBeNull();
  });

  it("reserves awaiting_payment → in_progress for the payment webhook", () => {
    expect(nextSteps("awaiting_payment", "pay_per_incident")).toEqual(["cancelled"]);
  });

  it("rejects jumps that skip steps", () => {
    expect(blockedReason("new", "completed", "included")).not.toBeNull();
    expect(blockedReason("quote_ready", "in_progress", "pay_per_incident")).not.toBeNull();
    expect(nextSteps("completed", "included")).toEqual([]);
  });
});
