-- meduSAAS · Phase 2 foundation (BRIEF.md §4, MED-006, MED-011)
-- Tenancy: every client row hangs from an organization. Clients read only their own
-- organizations; staff read everything, and only with MFA (aal2). Writes that change
-- state go through security-definer functions that validate and log them.

create extension if not exists citext;

create type public.venture as enum ('ORNIVA', 'VARKORA', 'CYRANTA');
create type public.member_role as enum ('client_owner', 'client_member');
create type public.staff_role as enum ('superadmin', 'operator');
create type public.ticket_status as enum (
  'new', 'evaluating', 'quote_ready', 'awaiting_payment', 'in_progress', 'client_review', 'completed', 'cancelled'
);
create type public.coverage_kind as enum ('to_assess', 'included', 'plan', 'warranty', 'pay_per_incident');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.event_type as enum ('call', 'milestone', 'delivery', 'payment', 'coverage', 'renewal');

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  industry text,
  city text,
  timezone text not null default 'America/Mexico_City',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text check (length(full_name) <= 120),
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'client_owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index on public.memberships (user_id);

-- Staff allowlist. Only rows inserted here (by SQL, never from the app) can enter /console.
create table public.staff (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.staff_role not null default 'operator',
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  venture public.venture not null,
  kind text not null check (kind in ('website', 'web_app', 'mobile_app', 'system', 'data')),
  url text,
  stack text,
  hosting_owner text not null check (hosting_owner in ('client', 'razzo')),
  hosting_provider text,
  code_owner text not null check (code_owner in ('client', 'razzo')),
  -- Included support: 1 calendar month after delivery (MED-008). Null = never had it / not set.
  support_ends_on date,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now()
);
create index on public.projects (organization_id);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1100) unique,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null check (length(title) between 3 and 140),
  description text not null default '' check (length(description) <= 4000),
  status public.ticket_status not null default 'new',
  coverage public.coverage_kind not null default 'to_assess',
  priority public.ticket_priority not null default 'normal',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tickets (organization_id, status);

-- Append-only history of every status change.
create table public.ticket_events (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  actor uuid references public.profiles (id) on delete set null,
  from_status public.ticket_status,
  to_status public.ticket_status not null,
  note text check (length(note) <= 2000),
  created_at timestamptz not null default now()
);
create index on public.ticket_events (ticket_id);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  type public.event_type not null,
  title text not null check (length(title) between 1 and 140),
  starts_at timestamptz not null,
  all_day boolean not null default false,
  minutes int check (minutes between 5 and 480),
  location text check (length(location) <= 200),
  staff_only boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.calendar_events (organization_id, starts_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (length(text) <= 300),
  link text check (link ~ '^/'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Helpers (security definer so policies don't recurse through RLS) ────────

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid())
     and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

create or replace function public.is_member(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

-- Lets the app know a signed-in user is staff before MFA (to send them to the MFA step).
create or replace function public.staff_pending_mfa() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid());
$$;

-- Every new auth user gets a profile.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Ticket state machine (mirrors src/lib/ticket-machine.ts) ────────────────

create or replace function public.ticket_transition_allowed(from_s public.ticket_status, to_s public.ticket_status)
returns boolean language sql immutable as $$
  select (from_s, to_s) in (
    ('new', 'evaluating'), ('new', 'cancelled'),
    ('evaluating', 'quote_ready'), ('evaluating', 'in_progress'), ('evaluating', 'cancelled'),
    ('quote_ready', 'awaiting_payment'), ('quote_ready', 'evaluating'), ('quote_ready', 'cancelled'),
    ('awaiting_payment', 'in_progress'), ('awaiting_payment', 'cancelled'),
    ('in_progress', 'client_review'),
    ('client_review', 'in_progress'), ('client_review', 'completed')
  );
$$;

create or replace function public.transition_ticket(
  p_ticket uuid, p_to public.ticket_status, p_note text default null, p_coverage public.coverage_kind default null
) returns public.tickets
language plpgsql security definer set search_path = '' as $$
declare
  t public.tickets;
  prev public.ticket_status;
  cov public.coverage_kind;
begin
  if not public.is_staff() then
    raise exception 'Only staff with MFA can change a ticket status' using errcode = '42501';
  end if;

  select * into t from public.tickets where id = p_ticket for update;
  if not found then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;

  if not public.ticket_transition_allowed(t.status, p_to) then
    raise exception 'Transition % → % is not allowed', t.status, p_to using errcode = '22023';
  end if;

  prev := t.status;
  cov := coalesce(p_coverage, t.coverage);

  -- Payment gate: nothing pay-per-incident starts without a confirmed payment.
  -- Straight from assessment, only covered work may start (included, plan or warranty).
  if p_to = 'in_progress' and t.status = 'evaluating' and cov not in ('included', 'plan', 'warranty') then
    raise exception 'Only covered work can start without a paid quote' using errcode = '22023';
  end if;
  -- awaiting_payment → in_progress is reserved for the verified payment webhook (Phase 3).
  if p_to = 'in_progress' and t.status = 'awaiting_payment' then
    raise exception 'Work starts when the payment webhook confirms it' using errcode = '22023';
  end if;

  update public.tickets
     set status = p_to, coverage = cov, updated_at = now()
   where id = p_ticket
  returning * into t;

  insert into public.ticket_events (ticket_id, actor, from_status, to_status, note)
  values (p_ticket, auth.uid(), prev, p_to, p_note);

  insert into public.audit_logs (actor, action, entity, entity_id, data)
  values (auth.uid(), 'ticket.transition', 'ticket', p_ticket::text, jsonb_build_object('to', p_to, 'coverage', cov));

  return t;
end;
$$;

-- Clients open tickets in their own organization; status always starts at 'new'.
create or replace function public.log_ticket_created() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.ticket_events (ticket_id, actor, from_status, to_status, note)
  values (new.id, new.created_by, null, new.status, 'Request created');
  return new;
end;
$$;

create trigger on_ticket_created
  after insert on public.tickets
  for each row execute function public.log_ticket_created();

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.staff enable row level security;
alter table public.projects enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_events enable row level security;
alter table public.calendar_events enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "members and staff read organizations" on public.organizations
  for select to authenticated using (public.is_member(id) or public.is_staff());
create policy "staff manage organizations" on public.organizations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "read own profile or staff" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Users may only change their name; email follows auth.users.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "read own memberships or staff" on public.memberships
  for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "staff manage memberships" on public.memberships
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "read own staff row" on public.staff
  for select to authenticated using (user_id = auth.uid());

create policy "members and staff read projects" on public.projects
  for select to authenticated using (public.is_member(organization_id) or public.is_staff());
create policy "staff manage projects" on public.projects
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "members and staff read tickets" on public.tickets
  for select to authenticated using (public.is_member(organization_id) or public.is_staff());
create policy "members open tickets in their org" on public.tickets
  for insert to authenticated with check (
    public.is_member(organization_id)
    and created_by = auth.uid()
    and status = 'new'
    and coverage = 'to_assess'
    and (project_id is null or exists (
      select 1 from public.projects p where p.id = project_id and p.organization_id = tickets.organization_id
    ))
  );
create policy "staff create tickets" on public.tickets
  for insert to authenticated with check (public.is_staff());
-- No direct UPDATE for anyone: status changes go through transition_ticket().
revoke update on public.tickets from authenticated;
grant update (title, description, priority, project_id) on public.tickets to authenticated;
create policy "staff edit ticket details" on public.tickets
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "members and staff read ticket history" on public.ticket_events
  for select to authenticated using (
    exists (select 1 from public.tickets t where t.id = ticket_id
            and (public.is_member(t.organization_id) or public.is_staff()))
  );

create policy "read calendar" on public.calendar_events
  for select to authenticated using (
    public.is_staff() or (public.is_member(organization_id) and not staff_only)
  );
create policy "staff manage calendar" on public.calendar_events
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "read own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy "staff notify" on public.notifications
  for insert to authenticated with check (public.is_staff());

create policy "staff read audit" on public.audit_logs
  for select to authenticated using (public.is_staff());

-- Anonymous visitors get nothing from these tables.
revoke all on all tables in schema public from anon;
