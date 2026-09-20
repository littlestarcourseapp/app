-- ============================================================
--  Little Star Course — Supabase Storage untuk materi (PDF/JPG)
--  Jalankan SEKALI di: Supabase → SQL Editor → New query → Run
--  Membuat bucket publik 'materials' + izin upload/baca lewat anon key.
-- ============================================================

-- 1) Bucket publik (bisa dibaca orang tua tanpa login)
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do update set public = true;

-- 2) Izin lewat anon key
drop policy if exists "materials_read"   on storage.objects;
drop policy if exists "materials_insert" on storage.objects;
drop policy if exists "materials_update" on storage.objects;
drop policy if exists "materials_delete" on storage.objects;

create policy "materials_read"   on storage.objects for select
  to anon, authenticated using (bucket_id = 'materials');

create policy "materials_insert" on storage.objects for insert
  to anon, authenticated with check (bucket_id = 'materials');

create policy "materials_update" on storage.objects for update
  to anon, authenticated using (bucket_id = 'materials') with check (bucket_id = 'materials');

create policy "materials_delete" on storage.objects for delete
  to anon, authenticated using (bucket_id = 'materials');
