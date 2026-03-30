-- Policies for the private bucket `archetypes` (upload/download as the logged-in user).
--
-- If Supabase SQL Editor returns: "must be owner of table objects"
--   1) Do NOT run ALTER on storage.objects — RLS is already enabled for Storage.
--   2) Use Dashboard → Storage → archetypes → Policies → New policy,
--      OR run this file with psql using the Postgres URI (user postgres) from
--      Project Settings → Database (`npm run db:storage-policies`).
--
-- Drop old names if you re-run
drop policy if exists archetypes_objects_select_own on storage.objects;
drop policy if exists archetypes_objects_insert_own on storage.objects;
drop policy if exists archetypes_objects_update_own on storage.objects;
drop policy if exists archetypes_objects_delete_own on storage.objects;

-- Authenticated users: read/write/delete only rows they own in this bucket
create policy archetypes_objects_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'archetypes' and owner = auth.uid());

create policy archetypes_objects_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'archetypes' and owner = auth.uid());

create policy archetypes_objects_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'archetypes' and owner = auth.uid())
  with check (bucket_id = 'archetypes' and owner = auth.uid());

create policy archetypes_objects_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'archetypes' and owner = auth.uid());
