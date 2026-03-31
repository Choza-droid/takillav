'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function findUserByEmail(email: string): Promise<{ id: string; full_name: string } | null> {
  const admin = createAdminClient()

  // Search in auth.users via admin client
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return null

  const authUser = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!authUser) return null

  // Get their profile
  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name')
    .eq('id', authUser.id)
    .single()

  return profile ? { id: profile.id, full_name: profile.full_name ?? '' } : { id: authUser.id, full_name: authUser.email ?? '' }
}

export async function addTeamMember(organizerId: string, memberEmail: string, eventId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const admin = createAdminClient()

  // Verify organizer
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== organizerId) return { error: 'No autorizado' }

  // Find member by email in auth.users
  const { data: usersData, error: listError } = await admin.auth.admin.listUsers()
  if (listError) return { error: 'Error al buscar usuario' }

  const authUser = usersData.users.find(u => u.email?.toLowerCase() === memberEmail.toLowerCase())
  if (!authUser) return { error: 'Este correo no está registrado en Takilla' }
  if (authUser.id === organizerId) return { error: 'No puedes agregarte a ti mismo' }

  // Get profile name
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', authUser.id)
    .single()

  // Insert team member
  const { error: insertError } = await supabase
    .from('team_members')
    .upsert(
      { organizer_id: organizerId, member_user_id: authUser.id, event_id: eventId },
      { onConflict: 'organizer_id,member_user_id,event_id' }
    )

  if (insertError) return { error: insertError.message }

  return {
    member: {
      id: crypto.randomUUID(),
      userId: authUser.id,
      fullName: profile?.full_name ?? authUser.email ?? '',
      email: authUser.email ?? '',
    }
  }
}