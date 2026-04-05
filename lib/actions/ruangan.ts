'use server'

import { createClient } from '@/lib/supabase/server'
import type { TipeRuangan } from '@/lib/types/database'

interface GetRuanganParams {
  search?: string
  kota?: string
  tipe?: TipeRuangan
  minHarga?: number
  maxHarga?: number
  sortBy?: 'recommended' | 'price-low' | 'price-high' | 'top-rated'
  page?: number
  limit?: number
  fasilitasIds?: string[]
}

/**
 * HELPER: Memastikan URL gambar valid dan menunjuk ke bucket foto-ruangan
 * Versi ULTRA-RESILIENT: Menggunakan hardcoded Project ID jika ENV gagal
 */
function sanitizeImageUrl(url: string | null): string {
  const fallback = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80";
  if (!url || url === '' || url === 'undefined' || url === 'null') return fallback;
  
  // Hardcoded Project ID untuk redundansi jika ENV gagal (Berdasarkan screenshot user @abvpmrfdbuccbheuovvv)
  const PROJECT_ID = "abvpmrfdbuccbheuovvv";
  const HARDCODED_BASE = `https://${PROJECT_ID}.supabase.co`;
  
  let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || HARDCODED_BASE).trim();
  
  // Bersihkan dari tanda kutip atau trailing slash
  supabaseUrl = supabaseUrl.replace(/['"]/g, '');
  if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);
  
  let path = url;

  // Jika URL absolute Supabase, extract path murninya
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const parts = url.split('/public/');
    const bucketAndPath = parts[parts.length - 1]; // "foto-ruangan/93d.../..."
    
    // Pastikan kita menggunakan bucket yang benar (foto-ruangan atau avatars)
    const finalUrl = `${supabaseUrl}/storage/v1/object/public/${bucketAndPath}`;
    console.log(`[IMAGE_REPAIR] Corrected Full URL: ${finalUrl}`);
    return finalUrl;
  } 
  
  // Jika URL absolute tetapi dari domain lain / tidak dikenal
  if (url.startsWith('http')) return url;

  // Jika berupa path relatif (misal: "userId/ruanganId/filename.jpg")
  // Kita asumsikan defaultnya masuk ke foto-ruangan
  path = path.replace(/\/+/g, '/');
  if (path.startsWith('/')) path = path.substring(1);

  const finalUrl = `${supabaseUrl}/storage/v1/object/public/foto-ruangan/${path}`;
  console.log(`[IMAGE_REPAIR] Built from path: ${finalUrl}`);
  return finalUrl;
}

export async function getRuanganList(params: GetRuanganParams = {}) {
  const supabase = await createClient()
  const { search, kota, tipe, minHarga, maxHarga, sortBy = 'recommended', page = 1, limit = 12 } = params

  let query = supabase
    .from('ruangan')
    .select(`*, ruangan_fasilitas(fasilitas(*)), foto_ruangan(*)`, { count: 'exact' })
    .eq('aktif', true)

  if (search) query = query.or(`nama.ilike.%${search}%,lokasi.ilike.%${search}%,kota.ilike.%${search}%`)
  if (kota) query = query.ilike('kota', `%${kota}%`)
  if (tipe) query = query.eq('tipe', tipe)
  if (minHarga) query = query.gte('harga_per_hari', minHarga)
  if (maxHarga) query = query.lte('harga_per_hari', maxHarga)

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return { data: [], count: 0, error: error.message }

  const transformed = (data || []).map((ruangan) => {
    const r = {
      ...ruangan,
      fasilitas: (ruangan.ruangan_fasilitas || []).map((rf: any) => rf.fasilitas).filter(Boolean),
      ruangan_fasilitas: undefined,
    }
    r.foto_utama = sanitizeImageUrl(r.foto_utama);
    if (r.foto_ruangan) {
      r.foto_ruangan = r.foto_ruangan.map((f: any) => ({ ...f, url: sanitizeImageUrl(f.url) }))
    }
    return r
  })

  return { data: transformed, count: count || 0, error: null }
}

export async function getRuanganById(id: string) {
  const supabase = await createClient()
  try { await supabase.rpc('increment_views', { ruangan_id_input: id }) } catch {}

  const { data, error } = await supabase
    .from('ruangan')
    .select(`*, ruangan_fasilitas(fasilitas(*)), foto_ruangan(*), profil:pemilik_id(*)`)
    .eq('id', id)
    .single()

  if (error) return null

  const transformed = {
    ...data,
    fasilitas: (data.ruangan_fasilitas || []).map((rf: any) => rf.fasilitas).filter(Boolean),
    pemilik: data.profil,
    ruangan_fasilitas: undefined,
    profil: undefined,
  }

  // Sanitize with fallback for owner avatar too
  if (transformed.pemilik) {
     transformed.pemilik.avatar_url = transformed.pemilik.avatar_url 
        ? sanitizeImageUrl(transformed.pemilik.avatar_url).replace('foto-ruangan', 'avatars') 
        : null;
  }

  transformed.foto_utama = sanitizeImageUrl(transformed.foto_utama);
  if (transformed.foto_ruangan) {
    transformed.foto_ruangan = transformed.foto_ruangan.map((f: any) => ({
      ...f,
      url: sanitizeImageUrl(f.url)
    })).sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
  }

  return transformed
}

export async function getRuanganPhotos(ruanganId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('foto_ruangan')
    .select('*')
    .eq('ruangan_id', ruanganId)
    .order('urutan', { ascending: true })

  if (error) return []
  return (data || []).map(f => ({ ...f, url: sanitizeImageUrl(f.url) }));
}

export async function getFeaturedRuangan(limit = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ruangan')
    .select(`*, ruangan_fasilitas(fasilitas(*)), foto_ruangan(*)`)
    .eq('aktif', true)
    .limit(limit)

  if (error) return []

  return (data || []).map((ruangan) => {
    const r = {
      ...ruangan,
      fasilitas: (ruangan.ruangan_fasilitas || []).map((rf: any) => rf.fasilitas).filter(Boolean),
      ruangan_fasilitas: undefined,
    }
    r.foto_utama = sanitizeImageUrl(r.foto_utama);
    return r
  })
}

export async function getFasilitas() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('fasilitas').select('*').order('nama')
  return error ? [] : data || []
}

export async function getUlasanByRuangan(ruanganId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ulasan')
    .select(`*, profil:penyewa_id(nama_lengkap, avatar_url)`)
    .eq('ruangan_id', ruanganId)
    .order('dibuat_pada', { ascending: false })
    .limit(10)

  if (error) return []
  return (data || []).map((ulasan) => ({
    ...ulasan,
    penyewa: ulasan.profil,
    profil: undefined,
  }))
}
