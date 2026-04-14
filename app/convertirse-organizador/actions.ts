'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function becomeOrganizer(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/convertirse-organizador')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'organizer' || profile?.role === 'admin') {
    redirect('/dashboard')
  }

  const tipo = formData.get('tipo') as string

  const { error } = await supabase.rpc('self_become_organizer')
  if (error) throw new Error(error.message)

  if (tipo === 'pago') {
    redirect('/dashboard/onboarding')
  } else {
    redirect('/dashboard/events')
  }
}
