-- Converts a wall-clock time in a client's time zone to an instant (used when staff schedule events).
create or replace function public.local_to_utc(p_local text, p_tz text) returns timestamptz
language sql immutable set search_path = '' as $$
  select (p_local::timestamp at time zone p_tz);
$$;
revoke execute on function public.local_to_utc(text, text) from anon;
