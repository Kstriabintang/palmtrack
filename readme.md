# 🌴 PalmTrack

<p align="center">
  <img src="https://img.shields.io/badge/status-in_development-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Laravel%2012%20%7C%20PostgreSQL-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge" />
</p>

<p align="center">
  <strong>Sistem Manajemen Perkebunan Sawit Terpadu</strong><br/>
  Platform web untuk mengelola peron, kebun, pekerja, dan keuangan usaha sawit skala kampung hingga menengah.
</p>

<p align="center">
  <em>Dari peron ke laporan — semua tercatat, semua terkontrol.</em>
</p>

<p align="center">
  <a href="https://kstriabintang.github.io/palmtrack/"><strong>🚀 Lihat Demo Langsung</strong></a>
</p>

> **Catatan demo:** Repositori ini menampilkan progres pengembangan `palmtrack-web` (Phase 1). Saat ini frontend berjalan dengan data contoh (belum terhubung ke backend Laravel sungguhan) untuk keperluan demonstrasi UI/UX dan alur kerja.

---

## 📌 Tentang PalmTrack

PalmTrack adalah sistem manajemen sawit berbasis web yang dirancang khusus untuk **pemilik peron dan kebun sawit** di Indonesia — dari skala kampung hingga menengah. Bukan sistem enterprise yang rumit, tapi cukup pintar untuk menggantikan buku catatan dan Excel berantakan yang selama ini dipakai.

**Siapa penggunanya?**
- 🏭 Pemilik **peron / TPH** (Tempat Pengumpulan Hasil)
- 🌿 Pemilik **kebun sawit** dengan beberapa blok/mandor
- 👷 Manager yang perlu pantau **absensi & gaji pekerja**
- 💰 Bos yang mau lihat **laporan keuangan** kapan saja

---

## ✨ Fitur Utama

### 🏭 Manajemen Peron
- Input timbangan — Bruto → Tare → Netto otomatis
- Data pengirim: nama petani, supir, dan plat truk
- Penetapan harga TBS harian (manual, ikuti harga Disbun setempat)
- Generate nota/kwitansi — cetak langsung atau share via WhatsApp (PDF)
- Pencatatan hutang petani + tracking pelunasan
- Rekap harian & mingguan transaksi peron

### 🌿 Manajemen Kebun
- Data blok/lahan: nama, luas (Ha), tahun tanam, lokasi
- Jadwal panen per blok & tracking realisasi vs rencana
- Input hasil panen: jumlah janjang, estimasi kg, mandor penanggung jawab
- Pencatatan biaya perawatan: pupuk, herbisida, dll per blok

### 👷 Manajemen Pekerja
- Absensi harian per pekerja / per mandor / per blok
- Perhitungan upah harian otomatis berdasarkan kehadiran
- Rekap gaji akhir bulan — siap bayar
- Export slip gaji (PDF)

### 💰 Keuangan Sederhana
- Pemasukan: pencatatan hasil jual TBS ke pabrik / PKS
- Pengeluaran: operasional kebun, peron, gaji, dll
- Hutang & piutang: ke petani plasma, pemasok, atau pihak ketiga
- Laporan bulanan & tahunan — export ke PDF dan Excel

### 📊 Dashboard & Laporan
- Ringkasan produksi harian & bulanan
- Grafik tren harga TBS vs hasil panen per periode
- Notifikasi jadwal panen yang mendekati waktu
- Multi-akun & multi-kebun dalam satu platform

---

## 🛠️ Tech Stack

### Frontend — Web Dashboard

| Layer | Teknologi |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Base UI) |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query v5) |
| Charts | Recharts |
| Form Handling | React Hook Form + Zod |
| PDF Client-side | jsPDF |
| Table | TanStack Table v9 |

> Next.js sempat dipertimbangkan, tapi dilepas karena PalmTrack adalah dashboard internal di balik login (bukan situs publik) — jadi SSR/SEO-nya Next.js tidak terpakai. Vite dipilih karena dev server & build jauh lebih cepat untuk kasus ini, tetap statis dan cocok di-deploy ke Cloudflare Pages.

### Backend — REST API

| Layer | Teknologi |
|---|---|
| Framework | Laravel 12 |
| Language | PHP 8.3 |
| Database | PostgreSQL 16 |
| Authentication | Laravel Sanctum (SPA) |
| PDF Server-side | Barryvdh/Laravel-DomPDF |
| Excel Export | Maatwebsite/Laravel-Excel |
| Queue | Laravel Queue (database driver) |
| File Storage | Local / S3-compatible |

### Infrastructure

| Layer | Teknologi |
|---|---|
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | VPS (Ubuntu) / Fly.io |
| Database Hosting | Supabase / self-hosted PostgreSQL |
| CDN & DNS | Cloudflare |
| CI/CD | GitHub Actions |
| SSL | Cloudflare (auto) |

---

## 📂 Struktur Repository

```
palmtrack/
│
├── palmtrack-web/              # React 19 + Vite — Web Dashboard
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth/
│   │   │   │   └── Login.tsx
│   │   │   ├── DashboardPage.tsx  # Dashboard utama
│   │   │   ├── peron/             # List, input, rekap, hutang petani
│   │   │   ├── kebun/             # Overview, blok lahan, panen
│   │   │   ├── pekerja/           # Data pekerja, absensi, gaji
│   │   │   ├── keuangan/          # Pemasukan, pengeluaran, hutang-piutang
│   │   │   └── laporan/           # Laporan bulanan & tahunan
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx      # Shell dashboard (sidebar)
│   │   │   └── AuthLayout.tsx     # Shell halaman login
│   │   ├── router.tsx             # Definisi React Router
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── forms/             # Reusable form components
│   │   │   ├── tables/            # Reusable table components
│   │   │   └── charts/            # Chart components
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios wrapper
│   │   │   ├── query-client.ts    # TanStack Query client
│   │   │   ├── utils.ts
│   │   │   └── validations/       # Zod schemas
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── stores/                # Zustand stores
│   │   └── types/                 # TypeScript type definitions
│   └── public/
│
├── palmtrack-api/              # Laravel 12 — REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   └── AuthController.php
│   │   │   │   ├── PeronController.php
│   │   │   │   ├── TimbanganController.php
│   │   │   │   ├── PetaniController.php
│   │   │   │   ├── HargaTbsController.php
│   │   │   │   ├── KebunController.php
│   │   │   │   ├── BlokLahanController.php
│   │   │   │   ├── PanenController.php
│   │   │   │   ├── PekerjaController.php
│   │   │   │   ├── AbsensiController.php
│   │   │   │   ├── GajiController.php
│   │   │   │   ├── KeuanganController.php
│   │   │   │   └── LaporanController.php
│   │   │   ├── Middleware/
│   │   │   │   └── RoleMiddleware.php
│   │   │   └── Requests/         # Form Request validation
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Peron.php
│   │   │   ├── Timbangan.php
│   │   │   ├── Petani.php
│   │   │   ├── HargaTbs.php
│   │   │   ├── Kebun.php
│   │   │   ├── BlokLahan.php
│   │   │   ├── Panen.php
│   │   │   ├── Pekerja.php
│   │   │   ├── Absensi.php
│   │   │   ├── Gaji.php
│   │   │   └── Transaksi.php
│   │   └── Services/
│   │       ├── TimbanganService.php
│   │       ├── GajiService.php
│   │       ├── LaporanService.php
│   │       └── PdfService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
└── README.md                   # File ini
```

---

## 🗄️ Skema Database

### Core Tables

```sql
-- Auth & Multi-tenant
users               (id, name, email, password, role, kebun_id, created_at)

-- Peron
peron               (id, nama, lokasi, user_id, created_at)
petani              (id, nama, alamat, telepon, peron_id)
kendaraan           (id, plat_nomor, supir, petani_id)
harga_tbs           (id, tanggal, harga_per_kg, peron_id)
timbangan           (id, tanggal, petani_id, kendaraan_id, peron_id,
                     bruto_kg, tare_kg, netto_kg, harga_per_kg,
                     total_bayar, status_bayar, keterangan, created_by)
hutang_peron        (id, petani_id, timbangan_id, jumlah, sisa_hutang,
                     status, tanggal_lunas)

-- Kebun
kebun               (id, nama, lokasi, luas_total_ha, user_id)
blok_lahan          (id, nama_blok, luas_ha, tahun_tanam, kebun_id, status)
panen               (id, tanggal, blok_id, mandor_id, jumlah_janjang,
                     estimasi_kg, aktual_kg, keterangan)
perawatan           (id, tanggal, blok_id, jenis, biaya, keterangan)

-- Pekerja & Gaji
pekerja             (id, nama, nik, jabatan, upah_harian, kebun_id,
                     tanggal_masuk, status_aktif)
absensi             (id, tanggal, pekerja_id, mandor_id, blok_id,
                     status, keterangan)
gaji                (id, periode_bulan, pekerja_id, hari_kerja,
                     upah_harian, total_gaji, status_bayar, dibayar_at)

-- Keuangan
transaksi           (id, tanggal, jenis, kategori, jumlah,
                     keterangan, kebun_id, created_by)
hutang_piutang      (id, pihak, jenis, jumlah, sisa, jatuh_tempo,
                     status, kebun_id)
```

---

## 🔐 Role & Hak Akses

| Role | Peron | Kebun | Pekerja | Keuangan | Laporan | Pengaturan |
|---|---|---|---|---|---|---|
| **Bos / Owner** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Mandor** | ❌ | ✅ View + Input | ✅ Absensi | ❌ | ❌ | ❌ |
| **Operator Peron** | ✅ Input + Nota | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Akuntan** | ✅ View | ✅ View | ✅ View Gaji | ✅ Full | ✅ Full | ❌ |

---

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js `>= 20.x`
- PHP `>= 8.3`
- Composer `>= 2.x`
- PostgreSQL `>= 16`
- pnpm `>= 9.x`

### 1. Clone Repository

```bash
git clone https://github.com/kstriabintang/palmtrack.git
cd palmtrack
```

### 2. Setup API (Laravel 12)

```bash
cd palmtrack-api

# Install PHP dependencies
composer install

# Copy & configure environment
cp .env.example .env
php artisan key:generate

# Edit .env — sesuaikan konfigurasi database
nano .env

# Jalankan migrasi & seeder awal
php artisan migrate --seed

# Start local server
php artisan serve
# → API berjalan di http://localhost:8000
```

### 3. Setup Web (React + Vite)

```bash
cd palmtrack-web

# Install dependencies
pnpm install

# Copy & configure environment
cp .env.example .env.local

# Edit .env.local
VITE_API_URL=http://localhost:8000/api

# Start development server
pnpm dev
# → Web berjalan di http://localhost:5173
```

---

## 🔧 Environment Variables

### Backend — `palmtrack-api/.env`

```env
APP_NAME="PalmTrack"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=palmtrack
DB_USERNAME=postgres
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173,palmtrack.id
SESSION_DOMAIN=localhost

FILESYSTEM_DISK=local
LOG_CHANNEL=daily
```

### Frontend — `palmtrack-web/.env.local`

```env
VITE_APP_NAME="PalmTrack"
VITE_API_URL=http://localhost:8000/api
```

---

## 📡 API Endpoints (Overview)

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Peron
  GET    /api/peron
  POST   /api/timbangan               ← Input timbang baru
  GET    /api/timbangan               ← List transaksi
  GET    /api/timbangan/{id}
  GET    /api/timbangan/{id}/nota     ← Generate PDF nota
  GET    /api/harga-tbs/hari-ini
  POST   /api/harga-tbs
  GET    /api/petani
  POST   /api/petani
  GET    /api/rekap/harian

Kebun
  GET    /api/kebun
  GET    /api/blok-lahan
  POST   /api/panen
  GET    /api/panen
  GET    /api/panen/jadwal

Pekerja
  GET    /api/pekerja
  POST   /api/absensi
  GET    /api/absensi/{tanggal}
  GET    /api/gaji/{periode}
  POST   /api/gaji/proses             ← Proses gaji bulanan

Keuangan
  GET    /api/transaksi
  POST   /api/transaksi
  GET    /api/hutang-piutang
  POST   /api/hutang-piutang

Laporan
  GET    /api/laporan/bulanan/{bulan}/{tahun}
  GET    /api/laporan/tahunan/{tahun}
  GET    /api/laporan/bulanan/{bulan}/{tahun}/export
```

---

## 🗺️ Roadmap

### ✅ Phase 0 — Setup (Done)
- [x] Inisiasi repository & struktur folder
- [x] Dokumentasi awal (README)

### 🔄 Phase 1 — Foundation & Peron (Current)
- [x] Setup project React 19 + Vite + shadcn/ui + Tailwind
- [ ] Setup project Laravel 12 + PostgreSQL 16
- [ ] Migrasi database — semua tabel utama
- [ ] Authentication & role management (Laravel Sanctum SPA)
- [ ] Modul Peron — Input timbang, data petani, harga TBS
- [ ] Generate & share nota PDF
- [ ] Rekap harian peron
- [ ] Dashboard overview

### 📋 Phase 2 — Kebun & Pekerja
- [ ] Modul Kebun — Data blok, jadwal & realisasi panen
- [ ] Modul Pekerja — Data SDM & absensi harian
- [ ] Modul Gaji — Kalkulasi & slip gaji bulanan
- [ ] Notifikasi jadwal panen

### 📊 Phase 3 — Keuangan & Laporan
- [ ] Modul Keuangan — Pemasukan, pengeluaran, hutang/piutang
- [ ] Laporan bulanan & tahunan
- [ ] Export PDF & Excel
- [ ] Grafik tren produksi & keuangan

### 📱 Phase 4 — Mobile App (Flutter)
- [ ] Flutter Android app (offline-first, SQLite)
- [ ] Bluetooth thermal printer (nota timbang)
- [ ] Background sync offline → online
- [ ] Push notification (jadwal panen, gaji)

---

## 🤝 Tim

| Nama | Role |
|---|---|
| [Ksatria Bintang Samudra](https://ksatriabintangsamudra.my.id) | Founder & Lead Developer |

---

## 📜 Lisensi

Copyright © 2026 Ksatria Bintang Samudra. All rights reserved.

Proyek ini bersifat proprietary dan tidak untuk distribusi terbuka tanpa izin tertulis dari pemilik.

---

<p align="center">
  🌴 Dibangun untuk para petani & pemilik sawit Indonesia<br/>
  <a href="https://palmtrack.id">palmtrack.id</a> · Pontianak, Kalimantan Barat
</p>
