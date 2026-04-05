'use server'

import { createClient } from '@/lib/supabase/server'

export async function createRuangan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const nama = formData.get('nama') as string
  const deskripsi = formData.get('deskripsi') as string || ''
  const tipe = formData.get('tipe') as string || 'HOT_DESK'
  const lokasi = formData.get('lokasi') as string
  const alamatLengkap = formData.get('alamat_lengkap') as string || ''
  const kota = formData.get('kota') as string
  const hargaPerJam = Number(formData.get('harga_per_jam') || 0)
  const hargaPerHari = Number(formData.get('harga_per_hari') || 0)
  const kapasitas = Number(formData.get('kapasitas') || 1)

  const { data, error } = await supabase
    .from('ruangan')
    .insert({
      pemilik_id: user.id,
      nama,
      deskripsi,
      tipe: tipe as 'HOT_DESK' | 'DEDICATED_DESK' | 'PRIVATE_OFFICE' | 'MEETING_ROOM' | 'EVENT_SPACE' | 'VIRTUAL_OFFICE',
      lokasi,
      alamat_lengkap: alamatLengkap,
      kota,
      harga_per_jam: hargaPerJam,
      harga_per_hari: hargaPerHari,
      kapasitas,
      foto_utama: '',
      aktif: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ruangan:', error)
    return { error: error.message }
  }

  // Handle fasilitas if provided
  const fasilitasIds = formData.getAll('fasilitas_ids') as string[]
  if (fasilitasIds.length > 0 && data) {
    const fasilitasInserts = fasilitasIds.map((fId) => ({
      ruangan_id: data.id,
      fasilitas_id: fId,
    }))

    await supabase.from('ruangan_fasilitas').insert(fasilitasInserts)
  }

  return { data, error: null }
}

export async function updateRuangan(ruanganId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const updates: Record<string, unknown> = {}
  const fields = ['nama', 'deskripsi', 'lokasi', 'alamat_lengkap', 'kota']
  
  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null) {
      updates[field] = value as string
    }
  }

  const numericFields = ['harga_per_jam', 'harga_per_hari', 'kapasitas']
  for (const field of numericFields) {
    const value = formData.get(field)
    if (value !== null) {
      updates[field] = Number(value)
    }
  }

  const tipe = formData.get('tipe')
  if (tipe) {
    updates.tipe = tipe as string
  }

  const aktif = formData.get('aktif')
  if (aktif !== null) {
    updates.aktif = aktif === 'true'
  }

  const { error } = await supabase
    .from('ruangan')
    .update(updates)
    .eq('id', ruanganId)
    .eq('pemilik_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Update fasilitas if provided
  const fasilitasIds = formData.getAll('fasilitas_ids') as string[]
  if (fasilitasIds.length > 0) {
    // Remove existing
    await supabase
      .from('ruangan_fasilitas')
      .delete()
      .eq('ruangan_id', ruanganId)

    // Insert new
    const fasilitasInserts = fasilitasIds.map((fId) => ({
      ruangan_id: ruanganId,
      fasilitas_id: fId,
    }))
    await supabase.from('ruangan_fasilitas').insert(fasilitasInserts)
  }

  return { success: true }
}

export async function deleteRuangan(ruanganId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { error } = await supabase
    .from('ruangan')
    .delete()
    .eq('id', ruanganId)
    .eq('pemilik_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteFotoRuangan(fotoId: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Tidak terautentikasi' }

  // 1. Get ruangan ID for later sync
  const { data: fotoInfo } = await supabase.from('foto_ruangan').select('ruangan_id').eq('id', fotoId).single()
  const ruanganId = fotoInfo?.ruangan_id

  // 2. Delete from storage
  await supabase.storage.from('foto-ruangan').remove([fileName])

  // 3. Delete from DB
  const { error: dbError } = await supabase.from('foto_ruangan').delete().eq('id', fotoId)
  if (dbError) return { error: dbError.message }

  // 4. Sync Thumbnail if needed
  if (ruanganId) {
    const { data: space } = await supabase.from('ruangan').select('foto_utama').eq('id', ruanganId).single()
    
    // Check if the current thumbnail still exists
    const { data: stillExists } = await supabase
      .from('foto_ruangan')
      .select('id')
      .eq('ruangan_id', ruanganId)
      .eq('url', space?.foto_utama || '')
      .single()

    if (!stillExists) {
      const { data: nextOne } = await supabase
        .from('foto_ruangan')
        .select('url')
        .eq('ruangan_id', ruanganId)
        .limit(1)
        .single()

      await supabase.from('ruangan').update({ foto_utama: nextOne?.url || '' }).eq('id', ruanganId)
    }
  }

  return { success: true }
}

export async function setFotoUtama(ruanganId: string, photoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('ruangan')
    .update({ foto_utama: photoUrl })
    .eq('id', ruanganId)
    .eq('pemilik_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadFotoRuangan(ruanganId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Tidak terautentikasi' }

  const files = formData.getAll('foto') as File[]
  if (files.length === 0) return { error: 'File foto diperlukan' }

  const results = []
  
  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const uniqueId = Math.random().toString(36).substring(2, 10)
    const fileName = `${user.id}/${ruanganId}/${Date.now()}-${uniqueId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('foto-ruangan')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Storage upload error for', file.name, ':', uploadError)
      results.push({ error: `Gagal upload ${file.name}: ${uploadError.message}` })
      continue
    }

    const { data: urlData } = supabase.storage
      .from('foto-ruangan')
      .getPublicUrl(fileName)

    const { data: fotoRecord, error: dbError }: { data: any; error: any } = await supabase
      .from('foto_ruangan')
      .insert({
        ruangan_id: ruanganId,
        url: urlData.publicUrl,
        storage_path: fileName,
        caption: '',
        urutan: results.length,
      })
      .select()
      .single()
    
    if (dbError) {
       console.error('DB Insert error for photo:', dbError)
       continue
    }

    if (fotoRecord) {
      results.push(fotoRecord)
      
      // ENSURE foto_utama is set if it's currently missing or empty
      const { data: currentRuangan } = await supabase
        .from('ruangan')
        .select('foto_utama')
        .eq('id', ruanganId)
        .single()
      
      if (!currentRuangan?.foto_utama || currentRuangan.foto_utama === '') {
        await supabase
          .from('ruangan')
          .update({ foto_utama: urlData.publicUrl })
          .eq('id', ruanganId)
      }
    }
  }

  const failures = results.filter((r: any) => r.error)
  if (failures.length > 0 && results.filter((r: any) => !r.error).length === 0) {
     return { error: (failures[0] as any).error }
  }

  return { data: results.filter((r: any) => !r.error), error: null }
}
