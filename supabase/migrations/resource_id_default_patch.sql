create extension if not exists pgcrypto with schema extensions;

alter table public.resources
  alter column id set default gen_random_uuid();
