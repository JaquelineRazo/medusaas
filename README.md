# meduSAAS

Conversational support and operations platform: Client Portal (`/app`) + Admin Workspace (`/console`), with Mavi as the assistant.

**Phase 2:** Next.js on Vercel + Supabase (Postgres with RLS, Auth with invitations and MFA for staff).
Live at https://medusaas.razzobusiness.com.

```bash
npm install
cp .env.example .env.local   # fill in the values (never commit .env.local)
npm run dev                  # http://localhost:3000
npm test                     # unit tests; module tests need local Supabase, RLS tests need SUPABASE_DB_*
```

**Module tests** run against a local Supabase in Docker, as real users through RLS, and are skipped when it isn't running:

```bash
npm run db:start             # first run pulls the images; applies supabase/migrations/
npm test
npm run db:stop
```

Helpers live in `tests/support/` (`clientAs(userId, aal)`, `fixtures()`, `admin()`). See `docs/architecture-plan.md`.

- Database: `supabase/migrations/` (apply with `npx supabase db push`). Auth settings: `supabase/config.toml` (`npx supabase config push`).
- Access: clients get a one-time invitation link from Client 360 and choose their own password. Staff are listed in `public.staff` (SQL only) and always pass MFA.
- Modules marked "demo" in the Admin Workspace still use sample data from `src/lib/mock.ts`.

Planning, copy and brand live in the sibling folder `razzo-strategy/06_medusaas/`.
