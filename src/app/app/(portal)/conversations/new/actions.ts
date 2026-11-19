"use server";

import { requireClient } from "@/lib/auth";
import type { RequestKind } from "@/lib/ticket-machine";
import { openRequest } from "@/lib/tickets";

export async function createRequest(input: { kind: RequestKind; projectId: string | null; details: string }) {
  const { supabase, user, orgs } = await requireClient();
  return openRequest(supabase, { userId: user.id, orgs }, input);
}
