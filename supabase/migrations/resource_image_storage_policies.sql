insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-images',
  'resource-images',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Resource images are publicly readable" on storage.objects;
drop policy if exists "Admins can upload resource images" on storage.objects;
drop policy if exists "Admins can update resource images" on storage.objects;
drop policy if exists "Admins can delete resource images" on storage.objects;

create policy "Resource images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'resource-images');

create policy "Admins can upload resource images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resource-images'
  and public.current_app_role() = 'admin'
);

create policy "Admins can update resource images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resource-images'
  and public.current_app_role() = 'admin'
)
with check (
  bucket_id = 'resource-images'
  and public.current_app_role() = 'admin'
);

create policy "Admins can delete resource images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resource-images'
  and public.current_app_role() = 'admin'
);
