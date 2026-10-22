import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

// Bypasses RLS. Only for actions already authorised as staff (requireStaff) on the server,
// such as creating auth users or generating invitation links.
export const createAdminClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
