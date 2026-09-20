-- ============================================================
--  Little Star Course — Skema database Supabase (Postgres)
--  Jalankan SEKALI di: Supabase → SQL Editor → New query → Run
--  Kolom dibuat "text" agar cocok dengan data lama dari Google Sheet.
-- ============================================================

-- ---------- MURID ----------
create table if not exists students (
  id               text primary key,
  nama             text,
  username         text,
  school           text,
  address          text,
  dob              text,
  grade            text,
  parent_name      text,
  wa_ortu          text,
  tutor_id         text,
  schedule         text,
  fee_per_meeting  text,
  fee_tentor       text,
  meeting_minutes  text,
  deposit_meetings text,
  add_fee          text,
  add_fee_note     text,
  pin              text,
  active           text,
  link_id          text,
  created_at       timestamptz default now()
);

-- ---------- TENTOR ----------
create table if not exists tutors (
  id         text primary key,
  nama       text,
  username   text,
  subject    text,
  level      text,
  address    text,
  dob        text,
  wa         text,
  pin        text,
  created_at timestamptz default now()
);

-- ---------- KELAS ----------
create table if not exists classes (
  id           text primary key,
  date         text,
  student_id   text,
  tutor_id     text,
  start_time   text,
  end_time     text,
  duration     text,
  type         text,
  topic        text,
  note         text,
  material_url text,   -- bisa banyak, dipisah '|'
  doc_url      text,   -- foto dokumentasi (base64 / URL)
  stu_in       text,
  stu_out      text,
  tut_in       text,
  tut_out      text,
  created_at   timestamptz default now()
);

-- ---------- DEPOSIT ----------
create table if not exists deposit (
  student_id      text primary key,
  paid_meetings   text,
  minutes_total   text,
  minutes_used    text,
  fee_per_meeting text,
  last_paid       text,
  status          text
);

-- ---------- PAYMENTS (penagihan) ----------
create table if not exists payments (
  id            text primary key,
  student_id    text,
  month         text,
  pay_date      text,
  meetings      text,
  price_per_meet text,
  duration      text,
  deposit_total text,
  carry_in      text,
  extra_minutes text,
  add_fee1      text,
  add_fee2      text,
  add_fee2_note text,
  next_meetings text,
  next_deposit  text,
  grand_total   text,
  status        text,
  created_at    timestamptz default now()
);

-- ---------- PENGATURAN (PIN portal) ----------
create table if not exists app_settings (
  key   text primary key,
  value text
);
insert into app_settings (key, value) values
  ('MASTER_PIN', '5758'),
  ('ADMIN_PIN',  '17081945')
on conflict (key) do nothing;

-- indeks bantu (pencarian per murid / bulan)
create index if not exists idx_classes_student on classes(student_id);
create index if not exists idx_classes_date    on classes(date);
create index if not exists idx_payments_student on payments(student_id);

-- ============================================================
--  Keamanan (RLS)
--  CATATAN: kebijakan di bawah membuka akses penuh lewat anon key,
--  setara dengan endpoint Apps Script sekarang yang juga terbuka.
--  Ini paling cepat & tidak lebih buruk dari sekarang.
--  Nanti bisa diperketat (login/RLS per-peran) sebagai langkah lanjut.
-- ============================================================
alter table students     enable row level security;
alter table tutors       enable row level security;
alter table classes      enable row level security;
alter table deposit      enable row level security;
alter table payments     enable row level security;
alter table app_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['students','tutors','classes','deposit','payments','app_settings']
  loop
    execute format('drop policy if exists p_all on %I;', t);
    execute format('create policy p_all on %I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;
