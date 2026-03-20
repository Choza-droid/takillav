import Link from 'next/link'
import { VT323 } from 'next/font/google'
import { stripe } from '@/utils/stripe/server'
import { createAdminClient } from '@/utils/supabase/admin'
import TicketQr from '@/app/tickets/_components/ticket-qr'

const vt323 = VT323({ weight: '400', subsets: ['latin'] })

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>
}

type TicketData = {
  id: string
  qr_hash: string
  eventTitle: string
  eventDate: string | null
  venueName: string | null
  venueCity: string | null
  tierName: string | null
  tierPrice: number | null
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id?.trim()

  const tickets: TicketData[] = []

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.mode === 'payment' && session.payment_status === 'paid') {
        const userId = session.metadata?.user_id?.trim()
        const tierId = session.metadata?.tier_id?.trim()
        const quantityRaw = Number(session.metadata?.quantity)
        const quantity = Number.isInteger(quantityRaw) ? quantityRaw : NaN

        if (userId && tierId && Number.isInteger(quantity) && quantity > 0 && quantity <= 10) {
          const admin = createAdminClient()
          const paymentIntentId =
            typeof session.payment_intent === 'string' ? session.payment_intent : null

          const { data: orderId, error: rpcError } = await admin.rpc('fulfill_checkout_session', {
            p_user_id: userId,
            p_tier_id: tierId,
            p_quantity: quantity,
            p_session_id: session.id,
            p_payment_intent_id: paymentIntentId,
          })

          if (rpcError) {
            console.error('[checkout/success] fulfill_checkout_session error:', rpcError)
          } else if (orderId) {
            const { data: rawTickets } = await admin
              .from('tickets')
              .select('id, qr_hash, tier_id, event_id')
              .eq('order_id', orderId)

            if (rawTickets?.length) {
              const tierIds = [...new Set(rawTickets.map((t) => t.tier_id))]
              const eventIds = [...new Set(rawTickets.map((t) => t.event_id))]

              const [{ data: tiers }, { data: events }] = await Promise.all([
                admin.from('ticket_tiers').select('id, name, price').in('id', tierIds),
                admin.from('events').select('id, title, event_date, venue_id').in('id', eventIds),
              ])

              const venueIds = [
                ...new Set(
                  (events ?? []).map((e) => e.venue_id).filter((id): id is string => !!id)
                ),
              ]
              const { data: venues } = venueIds.length
                ? await admin.from('venues').select('id, name, city').in('id', venueIds)
                : { data: [] as { id: string; name: string; city: string }[] }

              const tierMap = new Map((tiers ?? []).map((t) => [t.id, t]))
              const venueMap = new Map((venues ?? []).map((v) => [v.id, v]))
              const eventMap = new Map(
                (events ?? []).map((e) => [
                  e.id,
                  { ...e, venue: e.venue_id ? (venueMap.get(e.venue_id) ?? null) : null },
                ])
              )

              for (const t of rawTickets) {
                const ev = eventMap.get(t.event_id) ?? null
                const tier = tierMap.get(t.tier_id) ?? null
                tickets.push({
                  id: t.id,
                  qr_hash: t.qr_hash,
                  eventTitle: ev?.title ?? 'Evento',
                  eventDate: ev?.event_date ?? null,
                  venueName: (ev?.venue as { name: string; city: string } | null)?.name ?? null,
                  venueCity: (ev?.venue as { name: string; city: string } | null)?.city ?? null,
                  tierName: tier?.name ?? null,
                  tierPrice: tier ? Number(tier.price) : null,
                })
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[checkout/success] Error:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-8">
      <div className={`text-center ${vt323.className}`}>
        <p className="text-6xl tracking-widest text-green-700 uppercase">¡PAGO EXITOSO!</p>
        <p className="text-zinc-500 text-xl mt-1 tracking-wide">
          {tickets.length > 0
            ? 'Aquí están tus boletos'
            : 'Stripe confirmó tu pago. Tus boletos estarán listos en tu dashboard.'}
        </p>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-8">
          {tickets.map((ticket, i) => (
            <RetroTicket key={ticket.id} ticket={ticket} index={i} />
          ))}
        </div>
      )}

      <div className={`text-center ${vt323.className}`}>
        <Link
          href="/tickets"
          className="inline-block px-6 py-2 border-2 border-black bg-black text-amber-50 text-2xl tracking-widest uppercase hover:bg-zinc-800 transition-colors"
        >
          {'>'} Ir a mis boletos
        </Link>
      </div>
    </div>
  )
}

function RetroTicket({ ticket, index }: { ticket: TicketData; index: number }) {
  const date = ticket.eventDate
    ? new Date(ticket.eventDate)
        .toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        .toUpperCase()
    : null

  return (
    <div
      className={`border-4 border-black bg-amber-50 shadow-[8px_8px_0_0_#000] ${vt323.className}`}
    >
      {/* Header */}
      <div className="bg-black text-amber-50 px-5 py-2 flex items-center justify-between">
        <span className="text-2xl tracking-[0.3em] uppercase">★ TAKILLA ★</span>
        <span className="text-xl tracking-widest opacity-80">
          #{String(index + 1).padStart(4, '0')}
        </span>
      </div>

      {/* Event info */}
      <div className="px-5 pt-4 pb-3 space-y-3">
        <div>
          <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Evento</p>
          <p className="text-3xl text-zinc-900 leading-snug uppercase tracking-wide">
            {ticket.eventTitle}
          </p>
        </div>

        {date && (
          <div>
            <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Fecha</p>
            <p className="text-xl text-zinc-800 tracking-wide">{date}</p>
          </div>
        )}

        {(ticket.venueName || ticket.venueCity) && (
          <div>
            <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Lugar</p>
            <p className="text-xl text-zinc-800 tracking-wide uppercase">
              {[ticket.venueName, ticket.venueCity].filter(Boolean).join(' — ')}
            </p>
          </div>
        )}

        <div className="flex gap-8">
          {ticket.tierName && (
            <div>
              <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Tipo</p>
              <p className="text-xl text-zinc-800 uppercase">{ticket.tierName}</p>
            </div>
          )}
          {ticket.tierPrice !== null && (
            <div>
              <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Precio</p>
              <p className="text-xl text-zinc-800">
                {ticket.tierPrice === 0 ? 'GRATIS' : `$${ticket.tierPrice.toFixed(2)}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Perforated separator */}
      <div className="relative flex items-center mx-0 my-1">
        <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-white border-4 border-black" />
        <div className="flex-1 border-t-[3px] border-dashed border-black mx-5" />
        <div className="absolute -right-[18px] w-9 h-9 rounded-full bg-white border-4 border-black" />
      </div>

      {/* QR stub */}
      <div className="px-5 py-4 flex flex-col items-center gap-1">
        <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase self-start">
          Código de acceso
        </p>
        <TicketQr qrHash={ticket.qr_hash} />
      </div>
    </div>
  )
}
