alter table public.resources enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_status_check'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_status_check
      check (status in ('available', 'maintenance'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_capacity_positive_check'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_capacity_positive_check
      check (capacity is null or capacity > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_name_key'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_name_key unique (name);
  end if;
end $$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.role
  from public.users as u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.current_app_role() from anon;
grant execute on function public.current_app_role() to authenticated;

drop policy if exists "Resources are viewable by authenticated users" on public.resources;
drop policy if exists "Admins can insert resources" on public.resources;
drop policy if exists "Admins can update resources" on public.resources;
drop policy if exists "Admins can delete resources" on public.resources;

create policy "Resources are viewable by authenticated users"
on public.resources
for select
to authenticated
using (true);

create policy "Admins can insert resources"
on public.resources
for insert
to authenticated
with check (public.current_app_role() = 'admin');

create policy "Admins can update resources"
on public.resources
for update
to authenticated
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

create policy "Admins can delete resources"
on public.resources
for delete
to authenticated
using (
  public.current_app_role() = 'admin'
  and not exists (
    select 1
    from public.reservations as r
    where r.resource_id = resources.id
  )
);
