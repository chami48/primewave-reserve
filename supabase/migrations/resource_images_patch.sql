alter table public.resources
  add column if not exists image_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_image_url_length_check'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_image_url_length_check
      check (image_url is null or length(image_url) <= 1000);
  end if;
end $$;
