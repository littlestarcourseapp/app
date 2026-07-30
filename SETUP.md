# Little Star Course — Management Portal

Website 4-portal untuk bimbel: **Master Admin, Admin, Teacher, Parent**.
Desain warna & font mengikuti [littlestarcourse.com](https://littlestarcourse.com) (navy `#000080`, gold `#FFD700`, sky blue, olive green, font Poppins). Struktur backend diadaptasi dari referensi folder CHINESE (Google Apps Script + Google Sheets).

## Isi folder

```
WEBSITE/
├─ index.html          ← Landing / pemilih portal
├─ master-admin.html   ← Master Admin: cari murid/tentor, laporan lengkap, kirim WA ortu, Convert to PDF
├─ admin.html          ← Admin: Today's Class + Add Class, absensi murid & tentor, data murid & tentor, reports
├─ teacher.html        ← Teacher: jadwal hari ini, total fee bulan ini, isi topik/catatan/materi PDF
├─ parent.html         ← Parent: riwayat kelas, deposit, unduh materi PDF
├─ assets/style.css    ← Design system bersama
├─ assets/app.js       ← Helper + DEMO DATA + koneksi API  ← EDIT SCRIPT_URL DI SINI
├─ Code.gs             ← Backend Google Apps Script
└─ SETUP.md            ← File ini
```

## Coba langsung (Demo Mode)

Buka `index.html` di browser. Tanpa setup apa pun, semua portal sudah jalan memakai **data contoh** (Anton, Budi, Clara — sama seperti mockup). Cocok untuk melihat tampilan.

> Di Demo Mode, data yang diinput **tidak tersimpan permanen** (hilang saat halaman di-refresh).

## Menghubungkan ke Google Sheets (data tersimpan beneran)

1. Buka Google Sheets baru (kosong).
2. Menu **Extensions → Apps Script**.
3. Hapus isi default, **paste seluruh isi `Code.gs`**, lalu **Save** (ikon disket).
4. Klik **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**, izinkan akses, lalu **copy URL** yang berakhiran `/exec`.
5. Buka `assets/app.js`, isi baris pertama:
   ```js
   const SCRIPT_URL = 'https://script.google.com/macros/s/XXXX/exec';
   ```
6. Kembali ke Apps Script, di editor jalankan fungsi **`setupSheets`** sekali (pilih di dropdown → Run). Ini membuat 4 sheet otomatis: `Students`, `Tutors`, `Classes`, `Deposit`.
7. Selesai. Buka lagi `index.html` — sekarang semua data tersimpan di Google Sheets Anda.

## Alur kerja (sesuai catatan)

- **Kelola Murid & Tentor** (tambah/edit, PIN, fee) → hanya di **Master Admin**. Data murid termasuk School, Address, Date of Birth, Fee Orang Tua, dan **Fee Tentor** (dipakai hitung fee di portal tentor).
- **Portal Admin** hanya untuk: **Kelas Hari Ini (Add Class)**, **Absensi**, dan **Kalender Mingguan**.
- **Murid datang** → Admin klik **Add Class**, pilih murid + tentor, isi start time. Saat kelas selesai klik **Edit** untuk isi end time + dokumentasi foto.
- **Tentor** login → isi **Topik**, **Catatan**, dan upload **materi PDF** (bisa diunduh orang tua).
- **Absensi** murid & tentor (jam datang/pulang) di **Admin → Attendance**.
- **Pembayaran di muka** (deposit per jumlah meeting) → tampil di portal **Parent → Deposit**.
- **Akhir bulan** → **Master Admin → Search Student → buka laporan → WA Parents** (pesan otomatis) atau **Convert to PDF**.

## Login Tentor (PIN)

- Setiap tentor punya **PIN 4 digit** yang dibuat otomatis saat admin menambah tentor (kolom **PIN Login** di Admin → Tentor).
- Admin bisa membuat ulang PIN kapan saja lewat tombol 🔄 di tabel Tentor.
- Tentor membuka **Portal Tentor** → pilih nama + masukkan PIN → masuk. PIN salah / nama tak cocok ditolak.
- Demo PIN (sebelum konek Sheets): Mr. Yesaya `2468`, Ms. Dian `1357`, Mr. Kevin `9753`.

> **Setelah mengubah `Code.gs`** (mis. update ini), **deploy ulang**: Apps Script → **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. URL `/exec` tetap sama, tidak perlu ganti di `app.js`.

## Catatan

- Nomor WhatsApp otomatis diformat ke `62…` saat kirim.
- **Convert to PDF** memakai fitur cetak browser (Ctrl+P → Save as PDF).
- Login/password belum diaktifkan (semua portal terbuka). Bila butuh proteksi password sederhana, beri tahu — bisa ditambahkan.
- Upload file (foto & PDF) tersimpan ke Google Drive folder `LittleStar_Uploads` saat mode Sheets aktif.
