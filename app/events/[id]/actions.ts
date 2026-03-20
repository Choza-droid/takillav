'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function buyTicket(tierId: string, eventId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/events/${eventId}`)

  const { error: purchaseError } = await supabase.rpc('purchase_ticket', {
    tier_id_input: tierId,
  })

  if (purchaseError) throw new Error(purchaseError.message)

  revalidatePath(`/events/${eventId}`)
  redirect('/dashboard/tickets')
}
