'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function findProfileByEmail(email: string) {
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return { error: error.message }

  const authUser = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )
  if (!authUser) return { error: 'Este correo no está registrado en Takilla' }

  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name')
    .eq('id', authUser.id)
    .single()

  return {
    id: authUser.id,
    full_name: profile?.full_name ?? null,
    email: authUser.email ?? email,
  }
}