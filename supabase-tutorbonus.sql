-- ============================================================
--  Little Star Course — Tabel Komisi/Bonus Tentor (per bulan)
--  Jalankan SEKALI di: Supabase → SQL Editor → New query → Run
-- ============================================================
create table if not exists tutor_bonus (
  id         text primary key,   -- format: {tutor_id}_{YYYY-MM}
  tutor_id   text,
  month      text,               -- YYYY-MM
  amount     text,               -- nominal komisi/bonus
  note       text,               -- keterangan
  created_at timestamptz default now()
);

alter table tutor_bonus enable row level security;
drop policy if exists p_all on tutor_bonus;
create policy p_all on tutor_bonus for all to anon, authenticated using (true) with check (true);
