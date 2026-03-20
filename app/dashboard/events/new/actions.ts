'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { EVENT_IMAGES_BUCKET } from '@/utils/supabase/storage'

export async function createEvent(
  prevState: { error: string } | null,
  formData: FormData
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'organizer') return { error: 'Solo organizadores pueden crear eventos' }

  const title      = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const venue_id   = formData.get('venue_id') as string
  const image_file = formData.get('image_file') as File | null
  const status     = formData.get('status') as string

  if (!title?.trim())  return { error: 'El título es requerido' }
  if (!event_date)     return { error: 'La fecha es requerida' }

  let imagePath: string | null = null

  if (image_file && image_file.size > 0) {
    if (!image_file.type.startsWith('image/')) {
      return { error: 'El archivo debe ser una imagen válida' }
    }

    const extension = image_file.name.includes('.')
      ? image_file.name.split('.').pop()?.toLowerCase()
      : undefined
    const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg'
    imagePath = `${user.id}/${crypto.randomUUID()}.${safeExtension}`

    const { error: uploadError } = await supabase.storage
      .from(EVENT_IMAGES_BUCKET)
      .upload(imagePath, image_file, {
        contentType: image_file.type,
        upsert: false,
      })

    if (uploadError) {
      return { error: `No se pudo subir la imagen: ${uploadError.message}` }
    }
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      title:        title.trim(),
      description:  description?.trim() || null,
      event_date,
      venue_id:     venue_id  || null,
      image_url:    imagePath,
      status:       status || 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/events')
  redirect(`/dashboard/events/${event.id}`)
}
