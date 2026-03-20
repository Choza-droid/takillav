import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { startStripeCheckout } from './actions'

type CheckoutPageProps = {
  searchParams: Promise<{
    eventId?: string
    tierId?: string
    quantity?: string
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const eventId = params.eventId?.trim()
  const tierId = params.tierId?.trim()
  const quantityParsed = Number(params.quantity)
  const quantity = Number.isInteger(quantityParsed) ? quantityParsed : 1

  if (!eventId || !tierId) redirect('/events')

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/checkout?eventId=${eventId}&tierId=${tierId}&quantity=${quantity}`)

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('id, name, price, available_tickets, event_id, events(title, status, event_date)')
    .eq('id', tierId)
    .eq('event_id', eventId)
    .single()

  if (!tier) redirect(`/events/${eventId}`)

  const event = Array.isArray(tier.events)
    ? (tier.events[0] as { title: string; status: string; event_date: string } | undefined)
    : (tier.events as { title: string; status: string; event_date: string } | null)
  if (!event || event.status !== 'published') redirect(`/events/${eventId}`)

  const cappedQuantity = Math.min(Math.max(quantity, 1), 10)
  const finalQuantity = Math.min(cappedQuantity, tier.available_tickets)

  if (finalQuantity < 1) redirect(`/events/${eventId}`)

  const price = Number(tier.price)
  const total = price * finalQuantity

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/events/${eventId}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={14} />
        Volver al evento
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Checkout</p>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">Confirma tu compra</h1>
          <p className="text-zinc-500 mt-1">{event.title}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Tier</span>
            <span className="font-medium text-zinc-900">{tier.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Cantidad</span>
            <span className="font-medium text-zinc-900">{finalQuantity}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Precio por boleto</span>
            <span className="font-medium text-zinc-900">{price === 0 ? 'Gratis' : `$${price.toFixed(2)}`}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700">Total</span>
            <span className="text-xl font-bold text-zinc-900">{total === 0 ? 'Gratis' : `$${total.toFixed(2)}`}</span>
          </div>
        </div>

        <form action={startStripeCheckout} className="space-y-3">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="tierId" value={tierId} />
          <input type="hidden" name="quantity" value={String(finalQuantity)} />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition-colors"
          >
            {total === 0 ? 'Confirmar boletos gratis' : 'Ir a Stripe Checkout'}
          </button>

          <p className="text-xs text-zinc-400 text-center">
            {total === 0
              ? 'Se crearán tus boletos al confirmar.'
              : 'Serás redirigido a Stripe para completar tu pago.'}
          </p>
        </form>
      </div>
    </div>
  )
}
