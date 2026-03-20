import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import EventForm from './_components/event-form'

export default async function NewEventPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'organizer') redirect('/dashboard')

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, city')
    .order('name')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Nuevo evento</h1>
        <p className="text-zinc-500 mt-1">Completa la información básica. Los tiers de boletos se añaden después.</p>
      </div>
      <EventForm venues={venues ?? []} />
    </div>
  )
}
