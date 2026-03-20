import type { SupabaseClient } from '@supabase/supabase-js'

const EVENT_IMAGES_BUCKET = 'event-images'

export function resolveEventImageUrl(
  supabase: SupabaseClient,
  imageValue?: string | null
) {
  const value = imageValue?.trim()
  if (!value) return null

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  const { data } = supabase.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(value)
  return data.publicUrl
}

export { EVENT_IMAGES_BUCKET }
