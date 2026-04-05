'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PeranPengguna } from '@/lib/types/database'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user profile to determine redirect
  const { data: profile } = await supabase
    .from('profil')
    .select('peran')
    .eq('id', data.user.id)
    .single()

  if (redirectTo) {
    redirect(redirectTo)
  }

  redirect(profile?.peran === 'OWNER' ? '/owner/overview' : '/tenant/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const namaLengkap = formData.get('nama_lengkap') as string
  const peran = (formData.get('peran') as PeranPengguna) || 'TENANT'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap: namaLengkap,
        peran: peran,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is not required, redirect immediately
  if (data.user && !data.user.identities?.length) {
    return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' }
  }

  redirect(peran === 'OWNER' ? '/owner/overview' : '/tenant/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profil')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const updates: Record<string, string> = {}
  const fields = ['nama_lengkap', 'nomor_telepon', 'nama_bisnis', 'rekening_bank', 'nomor_rekening', 'telepon', 'alamat']
  
  // Map frontend form names to database fields
  const fieldMap: Record<string, string> = {
    telepon: 'nomor_telepon',
    alamat: 'nama_bisnis', // Using nama_bisnis to store address for now
  }
  
  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null) {
      const dbField = fieldMap[field] || field
      updates[dbField] = value as string
    }
  }

  const { error } = await supabase
    .from('profil')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const file = formData.get('avatar') as File
  if (!file) {
    return { error: 'File foto diperlukan' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Avatar upload error:', uploadError)
    return { error: 'Gagal mengunggah foto profil' }
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('profil')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  return { data: urlData.publicUrl, success: true }
}

export async function deleteAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Tidak terautentikasi' }

  // Get current avatar to delete from storage
  const { data: profile } = await supabase
    .from('profil')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    // Extract path from URL if possible, or we need to store path separately. 
    // For now we'll just clear the DB field as per usual patterns if path unknown,
    // but better to try and delete from storage.
    const urlParts = profile.avatar_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const fullPath = `${user.id}/${fileName}`
    
    await supabase.storage.from('avatars').remove([fullPath])
  }

  const { error } = await supabase
    .from('profil')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
