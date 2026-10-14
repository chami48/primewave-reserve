create extension if not exists pgcrypto with schema extensions;

alter table public.users
  alter column id set default extensions.gen_random_uuid();

alter table public.users
  alter column role set default 'employee';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_check
      check (role in ('admin', 'employee'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_auth_user_id_key'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, auth_user_id, full_name, email, role)
  values (
    extensions.gen_random_uuid(),
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'employee'
  )
  on conflict (auth_user_id) do update
    set
      full_name = excluded.full_name,
      email = excluded.email;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.handle_new_auth_user() from anon;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
