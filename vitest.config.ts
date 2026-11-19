import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { signJwt } from "./tests/support/jwt";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside the react-server condition; tests run server code directly.
      "server-only": fileURLToPath(new URL("./tests/support/empty.ts", import.meta.url)),
    },
  },
  test: {
    // Modules under test may create the admin client from these; point them at local Supabase.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_TEST_URL ?? "http://127.0.0.1:54321",
      SUPABASE_SECRET_KEY: signJwt({ role: "service_role" }),
    },
  },
});
