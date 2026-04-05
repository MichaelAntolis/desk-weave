// =====================================================
// TypeScript types matching the Supabase database schema
// =====================================================

export type PeranPengguna = 'OWNER' | 'TENANT'

export type StatusPemesanan =
  | 'PENDING'
  | 'MENUNGGU_VERIFIKASI'
  | 'DIKONFIRMASI'
  | 'DITOLAK'
  | 'DIBATALKAN'
  | 'SELESAI'

export type TipeRuangan =
  | 'HOT_DESK'
  | 'DEDICATED_DESK'
  | 'PRIVATE_OFFICE'
  | 'MEETING_ROOM'
  | 'EVENT_SPACE'
  | 'VIRTUAL_OFFICE'

// =====================================================
// Table Row Types
// =====================================================

export interface Profil {
  id: string
  nama_lengkap: string
  email: string
  peran: PeranPengguna
  nomor_telepon: string
  avatar_url: string
  nama_bisnis: string
  rekening_bank: string
  nomor_rekening: string
  dibuat_pada: string
  diperbarui_pada: string
}

export interface Fasilitas {
  id: string
  nama: string
  ikon: string
  dibuat_pada: string
}

export interface Ruangan {
  id: string
  pemilik_id: string
  nama: string
  deskripsi: string
  tipe: TipeRuangan
  lokasi: string
  alamat_lengkap: string
  kota: string
  harga_per_jam: number
  harga_per_hari: number
  kapasitas: number
  foto_utama: string
  aktif: boolean
  rata_rata_rating: number
  jumlah_ulasan: number
  jumlah_dilihat: number
  dibuat_pada: string
  diperbarui_pada: string
}

export interface RuanganFasilitas {
  ruangan_id: string
  fasilitas_id: string
}

export interface FotoRuangan {
  id: string
  ruangan_id: string
  url: string
  caption: string
  urutan: number
  dibuat_pada: string
}

export interface Pemesanan {
  id: string
  kode_pemesanan: string
  ruangan_id: string
  penyewa_id: string
  pemilik_id: string
  tanggal_mulai: string
  tanggal_selesai: string
  jam_mulai: string | null
  jam_selesai: string | null
  total_harga: number
  status: StatusPemesanan
  bukti_pembayaran_url: string
  catatan_penyewa: string
  catatan_pemilik: string
  diverifikasi_pada: string | null
  dibatalkan_pada: string | null
  dibuat_pada: string
  diperbarui_pada: string
}

export interface Ulasan {
  id: string
  ruangan_id: string
  penyewa_id: string
  pemesanan_id: string | null
  rating: number
  komentar: string
  dibuat_pada: string
}

export interface Pesan {
  id: string
  pengirim_id: string
  penerima_id: string
  isi: string
  dibaca: boolean
  pemesanan_id: string | null
  dibuat_pada: string
}

// =====================================================
// Joined / Extended Types (for frontend use)
// =====================================================

export interface RuanganWithFasilitas extends Ruangan {
  fasilitas: Fasilitas[]
  foto_ruangan: FotoRuangan[]
  pemilik?: Profil
}

export interface PemesananWithDetails extends Pemesanan {
  ruangan?: Ruangan
  penyewa?: Profil
  pemilik?: Profil
}

export interface UlasanWithPenyewa extends Ulasan {
  penyewa?: Profil
}

// =====================================================
// Database type for Supabase client generics
// =====================================================

export interface Database {
  public: {
    Tables: {
      profil: {
        Row: Profil
        Insert: Partial<Profil> & { id: string }
        Update: Partial<Profil>
      }
      fasilitas: {
        Row: Fasilitas
        Insert: Omit<Fasilitas, 'id' | 'dibuat_pada'>
        Update: Partial<Omit<Fasilitas, 'id'>>
      }
      ruangan: {
        Row: Ruangan
        Insert: Omit<Ruangan, 'id' | 'dibuat_pada' | 'diperbarui_pada' | 'rata_rata_rating' | 'jumlah_ulasan' | 'jumlah_dilihat'>
        Update: Partial<Omit<Ruangan, 'id'>>
      }
      ruangan_fasilitas: {
        Row: RuanganFasilitas
        Insert: RuanganFasilitas
        Update: RuanganFasilitas
      }
      foto_ruangan: {
        Row: FotoRuangan
        Insert: Omit<FotoRuangan, 'id' | 'dibuat_pada'>
        Update: Partial<Omit<FotoRuangan, 'id'>>
      }
      pemesanan: {
        Row: Pemesanan
        Insert: Omit<Pemesanan, 'id' | 'kode_pemesanan' | 'dibuat_pada' | 'diperbarui_pada' | 'diverifikasi_pada' | 'dibatalkan_pada'>
        Update: Partial<Omit<Pemesanan, 'id'>>
      }
      ulasan: {
        Row: Ulasan
        Insert: Omit<Ulasan, 'id' | 'dibuat_pada'>
        Update: Partial<Omit<Ulasan, 'id'>>
      }
      pesan: {
        Row: Pesan
        Insert: Omit<Pesan, 'id' | 'dibuat_pada'>
        Update: Partial<Omit<Pesan, 'id'>>
      }
    }
    Enums: {
      peran_pengguna: PeranPengguna
      status_pemesanan: StatusPemesanan
      tipe_ruangan: TipeRuangan
    }
  }
}
