'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function getBaseUrl(headerStore: Awaited<ReturnType<typeof headers>>) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const protocol = headerStore.get('x-forwarded-proto') ?? 'http'
  return `${protocol}://${host}`
}

export async function startStripeCheckout(formData: FormData) {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tierId = (formData.get('tierId') as string | null)?.trim()
  const eventId = (formData.get('eventId') as string | null)?.trim()
  const quantityRaw = Number(formData.get('quantity'))
  const quantity = Number.isInteger(quantityRaw) ? quantityRaw : 1

  if (!tierId || !eventId) throw new Error('Faltan datos del checkout')
  if (quantity < 1 || quantity > 10) throw new Error('Cantidad inválida')

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('id, name, price, available_tickets, event_id, events(title, status)')
    .eq('id', tierId)
    .eq('event_id', eventId)
    .single()

  if (!tier) throw new Error('Tier no encontrado')
  if (tier.available_tickets < quantity) throw new Error('No hay boletos suficientes')

  const event = Array.isArray(tier.events)
    ? (tier.events[0] as { title: string; status: string } | undefined)
    : null
  if (!event || event.status !== 'published') throw new Error('El evento no está disponible')

  const priceNumber = Number(tier.price)

  if (priceNumber === 0) {
    for (let i = 0; i < quantity; i++) {
      const { error } = await supabase.rpc('purchase_ticket', {
        tier_id_input: tierId,
      })
      if (error) throw new Error(error.message)
    }
    redirect('/dashboard/tickets')
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) throw new Error('Falta STRIPE_SECRET_KEY en variables de entorno')

  const baseUrl = getBaseUrl(headerStore)
  const successUrl = `${baseUrl}/checkout/success`
  const cancelUrl = `${baseUrl}/checkout?eventId=${eventId}&tierId=${tierId}&quantity=${quantity}`

  const payload = new URLSearchParams()
  payload.set('mode', 'payment')
  payload.set('success_url', successUrl)
  payload.set('cancel_url', cancelUrl)
  payload.set('line_items[0][quantity]', String(quantity))
  payload.set('line_items[0][price_data][currency]', 'mxn')
  payload.set('line_items[0][price_data][unit_amount]', String(Math.round(priceNumber * 100)))
  payload.set('line_items[0][price_data][product_data][name]', `${event.title} - ${tier.name}`)
  payload.set('metadata[user_id]', user.id)
  payload.set('metadata[event_id]', eventId)
  payload.set('metadata[tier_id]', tierId)
  payload.set('metadata[quantity]', String(quantity))

  if (user.email) {
    payload.set('customer_email', user.email)
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok || !data?.url) {
    const stripeMessage = data?.error?.message ?? 'No se pudo iniciar Stripe Checkout'
    throw new Error(stripeMessage)
  }

  redirect(data.url)
}
