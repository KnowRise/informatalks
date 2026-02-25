# Supabase RLS Policies untuk Tabel `surveys`

## Setup Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Buat tabel surveys dengan array columns
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topics text[] not null,
  description text not null,
  podcast_formats text[] not null,
  suggested_guest text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.surveys enable row level security;

-- Policy: Public dapat INSERT (user tanpa login)
create policy "public_insert"
on public.surveys
for insert
to anon
with check (true);

-- Policy: Authenticated user dapat SELECT (admin dashboard)
create policy "authenticated_select"
on public.surveys
for select
to authenticated
using (true);
```

## Penjelasan

- **anon**: user tanpa login (form publik)
- **authenticated**: user yang sudah login (dashboard admin)
- RLS memastikan hanya admin yang bisa lihat data, tapi semua orang bisa submit form.
- **Array columns** (`topics`, `podcast_formats`): 1 user = 1 row, stats akurat!

## Cara Pakai

1. Copy SQL di atas
2. Buka Supabase Dashboard → SQL Editor
3. Paste dan Run
4. Done! 🎉

## Migration (Kalau Sudah Ada Data Lama)

Kalau sudah ada tabel `surveys` dengan struktur lama (non-array), jalankan ini:

```sql
-- Backup data lama
create table surveys_old as select * from surveys;

-- Drop tabel lama
drop table surveys;

-- Buat tabel baru (schema di atas)
-- ... (paste schema baru)

-- TIDAK BISA auto-migrate karena struktur berbeda
-- Kalau perlu data lama, manual insert dengan convert ke array
```

Kalau belum ada data atau mau fresh start, langsung drop + create aja.
