alter table public.reservations enable row level security;

create extension if not exists pgcrypto with schema extensions;

alter table public.reservations
  alter column id set default extensions.gen_random_uuid();

alter table public.reservations
  alter column status set default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservations_status_check'
      and conrelid = 'public.reservations'::regclass
  ) then
    alter table public.reservations
      add constraint reservations_status_check
      check (status in ('pending', 'confirmed', 'cancelled'));
  end if;
end $$;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from public.users as u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_app_user_id() from public;
revoke all on function public.current_app_user_id() from anon;
grant execute on function public.current_app_user_id() to authenticated;

create or replace function public.cancel_own_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app_user_id uuid;
  v_updated_reservation public.reservations;
begin
  v_app_user_id := public.current_app_user_id();

  if v_app_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  update public.reservations as r
  set status = 'cancelled'
  where r.id = p_reservation_id
    and r.user_id = v_app_user_id
    and r.status in ('pending', 'confirmed')
    and r.start_time > now()
  returning r.* into v_updated_reservation;

  if v_updated_reservation.id is null then
    raise exception 'Reservation cannot be cancelled'
      using errcode = 'P0001';
  end if;

  return v_updated_reservation;
end;
$$;

revoke all on function public.cancel_own_reservation(uuid) from public;
revoke all on function public.cancel_own_reservation(uuid) from anon;
grant execute on function public.cancel_own_reservation(uuid) to authenticated;

create or replace function public.get_resource_booked_slots(
  p_resource_id uuid,
  p_day_start timestamptz,
  p_day_end timestamptz
)
returns table (
  id uuid,
  start_time timestamptz,
  end_time timestamptz,
  status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.start_time, r.end_time, r.status
  from public.reservations as r
  where r.resource_id = p_resource_id
    and r.status in ('pending', 'confirmed')
    and r.start_time < p_day_end
    and r.end_time > p_day_start
  order by r.start_time asc
$$;

revoke all on function public.get_resource_booked_slots(uuid, timestamptz, timestamptz) from public;
revoke all on function public.get_resource_booked_slots(uuid, timestamptz, timestamptz) from anon;
grant execute on function public.get_resource_booked_slots(uuid, timestamptz, timestamptz) to authenticated;

drop policy if exists "Users can view own reservations" on public.reservations;
drop policy if exists "Admins can view all reservations" on public.reservations;
drop policy if exists "Users can create own reservations" on public.reservations;
drop policy if exists "Users can cancel own reservations" on public.reservations;
drop policy if exists "Admins can manage reservations" on public.reservations;
drop policy if exists "Admins can insert reservations" on public.reservations;
drop policy if exists "Admins can update reservations" on public.reservations;

create policy "Users can view own reservations"
on public.reservations
for select
to authenticated
using (user_id = public.current_app_user_id());

create policy "Users can create own reservations"
on public.reservations
for insert
to authenticated
with check (
  user_id = public.current_app_user_id()
  and status in ('pending', 'confirmed')
  and start_time > now()
  and end_time > start_time
  and exists (
    select 1
    from public.resources as r
    where r.id = resource_id
      and r.status = 'available'
  )
);

create policy "Admins can view all reservations"
on public.reservations
for select
to authenticated
using (public.current_app_role() = 'admin');

create policy "Admins can insert reservations"
on public.reservations
for insert
to authenticated
with check (public.current_app_role() = 'admin');

create policy "Admins can update reservations"
on public.reservations
for update
to authenticated
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
