import { createHmac } from "node:crypto";

// Local Supabase signs with this documented default secret (not a production secret).
export const LOCAL_JWT_SECRET = process.env.SUPABASE_TEST_JWT_SECRET ?? "super-secret-jwt-token-with-at-least-32-characters-long";

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");

/** HS256 token the local API accepts, like the ones GoTrue issues. */
export function signJwt(claims: Record<string, unknown>, ttlSeconds = 3600) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ iss: "supabase-test", ...claims, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  const sig = createHmac("sha256", LOCAL_JWT_SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
