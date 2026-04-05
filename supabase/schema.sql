-- =====================================================
-- DESKWEAVE - SCHEMA DATABASE LENGKAP
-- Platform: Supabase (PostgreSQL)
-- Bahasa: Indonesia
-- 
-- CARA PAKAI:
-- 1. Buat project di supabase.com
-- 2. Buka SQL Editor di Supabase Dashboard
-- 3. Copy-paste SELURUH isi file ini
-- 4. Klik "Run" 
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CUSTOM TYPES (ENUM)
-- =====================================================
CREATE TYPE peran_pengguna AS ENUM ('OWNER', 'TENANT');

CREATE TYPE status_pemesanan AS ENUM (
  'PENDING',                  -- Baru dibuat, belum bayar
  'MENUNGGU_VERIFIKASI',      -- Bukti bayar sudah diupload
  'DIKONFIRMASI',             -- Owner sudah approve
  'DITOLAK',                  -- Owner reject (bisa re-upload)
  'DIBATALKAN',               -- Dibatalkan oleh tenant
  'SELESAI'                   -- Booking sudah lewat masa berlaku
);

CREATE TYPE tipe_ruangan AS ENUM (
  'HOT_DESK',
  'DEDICATED_DESK', 
  'PRIVATE_OFFICE',
  'MEETING_ROOM',
  'EVENT_SPACE',
  'VIRTUAL_OFFICE'
);

-- =====================================================
-- 3. TABEL: profil
-- Ekstensi dari auth.users (auto-create via trigger)
-- =====================================================
CREATE TABLE profil (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  peran peran_pengguna NOT NULL DEFAULT 'TENANT',
  nomor_telepon TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  
  -- Khusus Owner
  nama_bisnis TEXT DEFAULT '',
  rekening_bank TEXT DEFAULT '',
  nomor_rekening TEXT DEFAULT '',
  
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. TABEL: fasilitas (Master Data)
-- =====================================================
CREATE TABLE fasilitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  ikon TEXT DEFAULT 'circle',   -- nama ikon Lucide
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. TABEL: ruangan
-- =====================================================
CREATE TABLE ruangan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pemilik_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  
  nama TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  tipe tipe_ruangan NOT NULL DEFAULT 'HOT_DESK',
  lokasi TEXT NOT NULL DEFAULT '',          -- mis: "SCBD, Jakarta"
  alamat_lengkap TEXT DEFAULT '',           -- alamat detail
  kota TEXT NOT NULL DEFAULT '',
  
  harga_per_jam BIGINT NOT NULL DEFAULT 0,
  harga_per_hari BIGINT NOT NULL DEFAULT 0,
  kapasitas INT NOT NULL DEFAULT 1,
  
  foto_utama TEXT DEFAULT '',              -- URL foto utama
  aktif BOOLEAN NOT NULL DEFAULT true,     -- tampil di explore atau tidak
  
  rata_rata_rating DECIMAL(2,1) DEFAULT 0,
  jumlah_ulasan INT DEFAULT 0,
  jumlah_dilihat INT DEFAULT 0,
  
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 6. TABEL: ruangan_fasilitas (Junction M2M)
-- =====================================================
CREATE TABLE ruangan_fasilitas (
  ruangan_id UUID NOT NULL REFERENCES ruangan(id) ON DELETE CASCADE,
  fasilitas_id UUID NOT NULL REFERENCES fasilitas(id) ON DELETE CASCADE,
  PRIMARY KEY (ruangan_id, fasilitas_id)
);

-- =====================================================
-- 7. TABEL: foto_ruangan (Galeri)
-- =====================================================
CREATE TABLE foto_ruangan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruangan_id UUID NOT NULL REFERENCES ruangan(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  urutan INT DEFAULT 0,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 8. TABEL: pemesanan
-- =====================================================
CREATE TABLE pemesanan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_pemesanan TEXT NOT NULL UNIQUE,      -- mis: "BK-20241025-XXXX"
  
  ruangan_id UUID NOT NULL REFERENCES ruangan(id) ON DELETE RESTRICT,
  penyewa_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  pemilik_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jam_mulai TIME,                          -- opsional, untuk booking per jam
  jam_selesai TIME,
  
  total_harga BIGINT NOT NULL DEFAULT 0,
  status status_pemesanan NOT NULL DEFAULT 'PENDING',
  
  bukti_pembayaran_url TEXT DEFAULT '',     -- URL file bukti transfer
  catatan_penyewa TEXT DEFAULT '',
  catatan_pemilik TEXT DEFAULT '',          -- alasan reject, dll
  
  diverifikasi_pada TIMESTAMPTZ,
  dibatalkan_pada TIMESTAMPTZ,
  
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: tanggal selesai harus >= tanggal mulai
  CONSTRAINT cek_tanggal CHECK (tanggal_selesai >= tanggal_mulai)
);

-- =====================================================
-- 9. TABEL: ulasan
-- =====================================================
CREATE TABLE ulasan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruangan_id UUID NOT NULL REFERENCES ruangan(id) ON DELETE CASCADE,
  penyewa_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  pemesanan_id UUID REFERENCES pemesanan(id) ON DELETE SET NULL,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  komentar TEXT DEFAULT '',
  
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 1 user hanya bisa review 1x per booking
  UNIQUE(penyewa_id, pemesanan_id)
);

-- =====================================================
-- 10. TABEL: pesan
-- =====================================================
CREATE TABLE pesan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pengirim_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  penerima_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  
  isi TEXT NOT NULL,
  dibaca BOOLEAN NOT NULL DEFAULT false,
  
  -- Opsional: link ke pemesanan terkait
  pemesanan_id UUID REFERENCES pemesanan(id) ON DELETE SET NULL,
  
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 11. INDEXES (Performa Query)
-- =====================================================
CREATE INDEX idx_ruangan_pemilik ON ruangan(pemilik_id);
CREATE INDEX idx_ruangan_kota ON ruangan(kota);
CREATE INDEX idx_ruangan_tipe ON ruangan(tipe);
CREATE INDEX idx_ruangan_aktif ON ruangan(aktif);
CREATE INDEX idx_ruangan_harga ON ruangan(harga_per_hari);

CREATE INDEX idx_pemesanan_penyewa ON pemesanan(penyewa_id);
CREATE INDEX idx_pemesanan_pemilik ON pemesanan(pemilik_id);
CREATE INDEX idx_pemesanan_ruangan ON pemesanan(ruangan_id);
CREATE INDEX idx_pemesanan_status ON pemesanan(status);
CREATE INDEX idx_pemesanan_tanggal ON pemesanan(tanggal_mulai, tanggal_selesai);

CREATE INDEX idx_ulasan_ruangan ON ulasan(ruangan_id);
CREATE INDEX idx_pesan_pengirim ON pesan(pengirim_id);
CREATE INDEX idx_pesan_penerima ON pesan(penerima_id);
CREATE INDEX idx_pesan_dibaca ON pesan(dibaca);

-- =====================================================
-- 12. FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update kolom diperbarui_pada
CREATE OR REPLACE FUNCTION update_diperbarui_pada()
RETURNS TRIGGER AS $$
BEGIN
  NEW.diperbarui_pada = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profil_update
  BEFORE UPDATE ON profil
  FOR EACH ROW EXECUTE FUNCTION update_diperbarui_pada();

CREATE TRIGGER trg_ruangan_update
  BEFORE UPDATE ON ruangan
  FOR EACH ROW EXECUTE FUNCTION update_diperbarui_pada();

CREATE TRIGGER trg_pemesanan_update
  BEFORE UPDATE ON pemesanan
  FOR EACH ROW EXECUTE FUNCTION update_diperbarui_pada();

-- Auto-create profil saat user baru register
CREATE OR REPLACE FUNCTION handle_user_baru()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profil (id, nama_lengkap, email, peran)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'peran')::peran_pengguna, 'TENANT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_baru();

-- Auto-update rata_rata_rating di tabel ruangan setelah ulasan baru
CREATE OR REPLACE FUNCTION update_rating_ruangan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ruangan SET 
    rata_rata_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) 
      FROM ulasan 
      WHERE ruangan_id = COALESCE(NEW.ruangan_id, OLD.ruangan_id)
    ),
    jumlah_ulasan = (
      SELECT COUNT(*) 
      FROM ulasan 
      WHERE ruangan_id = COALESCE(NEW.ruangan_id, OLD.ruangan_id)
    )
  WHERE id = COALESCE(NEW.ruangan_id, OLD.ruangan_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ulasan_rating
  AFTER INSERT OR UPDATE OR DELETE ON ulasan
  FOR EACH ROW EXECUTE FUNCTION update_rating_ruangan();

-- Auto-generate kode pemesanan
CREATE OR REPLACE FUNCTION generate_kode_pemesanan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.kode_pemesanan IS NULL OR NEW.kode_pemesanan = '' THEN
    NEW.kode_pemesanan = 'BK-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                          UPPER(SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kode_pemesanan
  BEFORE INSERT ON pemesanan
  FOR EACH ROW EXECUTE FUNCTION generate_kode_pemesanan();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan_fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto_ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemesanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ulasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesan ENABLE ROW LEVEL SECURITY;

-- === PROFIL ===
CREATE POLICY "Profil bisa dibaca oleh semua user login"
  ON profil FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "User hanya bisa edit profil sendiri"
  ON profil FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- === RUANGAN ===
CREATE POLICY "Ruangan aktif bisa dibaca oleh siapa saja"
  ON ruangan FOR SELECT
  USING (aktif = true OR pemilik_id = auth.uid());

CREATE POLICY "Owner bisa buat ruangan"
  ON ruangan FOR INSERT
  TO authenticated
  WITH CHECK (
    pemilik_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'OWNER')
  );

CREATE POLICY "Owner bisa edit ruangan sendiri"
  ON ruangan FOR UPDATE
  TO authenticated
  USING (pemilik_id = auth.uid());

CREATE POLICY "Owner bisa hapus ruangan sendiri"
  ON ruangan FOR DELETE
  TO authenticated
  USING (pemilik_id = auth.uid());

-- === RUANGAN_FASILITAS ===
CREATE POLICY "Fasilitas ruangan bisa dibaca semua"
  ON ruangan_fasilitas FOR SELECT
  USING (true);

CREATE POLICY "Owner bisa kelola fasilitas ruangannya"
  ON ruangan_fasilitas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM ruangan WHERE id = ruangan_id AND pemilik_id = auth.uid())
  );

CREATE POLICY "Owner bisa hapus fasilitas ruangannya"
  ON ruangan_fasilitas FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM ruangan WHERE id = ruangan_id AND pemilik_id = auth.uid())
  );

-- === FOTO_RUANGAN ===
CREATE POLICY "Foto ruangan bisa dibaca semua"
  ON foto_ruangan FOR SELECT
  USING (true);

CREATE POLICY "Owner bisa upload foto ruangannya"
  ON foto_ruangan FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM ruangan WHERE id = ruangan_id AND pemilik_id = auth.uid())
  );

CREATE POLICY "Owner bisa hapus foto ruangannya"
  ON foto_ruangan FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM ruangan WHERE id = ruangan_id AND pemilik_id = auth.uid())
  );

-- === FASILITAS ===
CREATE POLICY "Fasilitas bisa dibaca semua"
  ON fasilitas FOR SELECT
  USING (true);

CREATE POLICY "Hanya owner yang bisa tambah fasilitas"
  ON fasilitas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'OWNER')
  );

-- === PEMESANAN ===
CREATE POLICY "Tenant bisa lihat pemesanan sendiri"
  ON pemesanan FOR SELECT
  TO authenticated
  USING (penyewa_id = auth.uid() OR pemilik_id = auth.uid());

CREATE POLICY "Tenant bisa buat pemesanan"
  ON pemesanan FOR INSERT
  TO authenticated
  WITH CHECK (
    penyewa_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'TENANT')
  );

CREATE POLICY "Tenant dan Owner bisa update pemesanan terkait"
  ON pemesanan FOR UPDATE
  TO authenticated
  USING (penyewa_id = auth.uid() OR pemilik_id = auth.uid());

-- === ULASAN ===
CREATE POLICY "Ulasan bisa dibaca semua"
  ON ulasan FOR SELECT
  USING (true);

CREATE POLICY "Tenant bisa buat ulasan"
  ON ulasan FOR INSERT
  TO authenticated
  WITH CHECK (
    penyewa_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'TENANT')
  );

-- === PESAN ===
CREATE POLICY "User bisa baca pesan sendiri"
  ON pesan FOR SELECT
  TO authenticated
  USING (pengirim_id = auth.uid() OR penerima_id = auth.uid());

CREATE POLICY "User bisa kirim pesan"
  ON pesan FOR INSERT
  TO authenticated
  WITH CHECK (pengirim_id = auth.uid());

CREATE POLICY "Penerima bisa update status baca"
  ON pesan FOR UPDATE
  TO authenticated
  USING (penerima_id = auth.uid());

-- =====================================================
-- 14. STORAGE BUCKETS
-- Jalankan ini di SQL Editor juga
-- =====================================================

-- Bucket untuk avatar (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk foto ruangan (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('foto-ruangan', 'foto-ruangan', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk bukti pembayaran (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bukti-pembayaran', 'bukti-pembayaran', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Avatar
CREATE POLICY "Avatar bisa dilihat semua"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatar');

CREATE POLICY "User bisa upload avatar sendiri"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatar' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "User bisa update avatar sendiri"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatar' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policies: Foto Ruangan
CREATE POLICY "Foto ruangan bisa dilihat semua"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'foto-ruangan');

CREATE POLICY "Owner bisa upload foto ruangan"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'foto-ruangan' AND
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'OWNER')
  );

CREATE POLICY "Owner bisa hapus foto ruangan"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'foto-ruangan' AND
    EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'OWNER')
  );

-- Storage Policies: Bukti Pembayaran (Private)
CREATE POLICY "Bukti pembayaran bisa dilihat oleh tenant dan owner terkait"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'bukti-pembayaran' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM pemesanan 
        WHERE pemilik_id = auth.uid() 
        AND bukti_pembayaran_url LIKE '%' || name || '%'
      )
    )
  );

CREATE POLICY "Tenant bisa upload bukti pembayaran"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'bukti-pembayaran' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 15. SEED DATA: Fasilitas Default
-- =====================================================
INSERT INTO fasilitas (nama, ikon) VALUES
  ('WiFi Kecepatan Tinggi', 'wifi'),
  ('AC / Pendingin Ruangan', 'snowflake'),
  ('Proyektor', 'projector'),
  ('Whiteboard', 'presentation'),
  ('Dapur Bersama', 'utensils'),
  ('Parkir Mobil', 'car'),
  ('Parkir Motor', 'bike'),
  ('Mesin Kopi', 'coffee'),
  ('Ruang Meeting', 'users'),
  ('Loker Pribadi', 'lock'),
  ('Akses 24 Jam', 'clock'),
  ('Resepsionis', 'user-check'),
  ('Printer / Scanner', 'printer'),
  ('Telepon', 'phone'),
  ('CCTV / Keamanan', 'shield'),
  ('Smoking Area', 'cigarette'),
  ('Pantry', 'refrigerator'),
  ('Standing Desk', 'monitor'),
  ('Gym / Fitness', 'dumbbell'),
  ('Taman / Area Hijau', 'leaf')
ON CONFLICT (nama) DO NOTHING;

-- =====================================================
-- SELESAI! 🎉
-- Database DeskWeave siap digunakan.
-- =====================================================
