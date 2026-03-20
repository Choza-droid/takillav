import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { resolveEventImageUrl } from '@/utils/supabase/storage'
import { Ticket, FileSearch } from 'lucide-react'
import EventTicketCard from './_components/event-ticket-card'

export default async function TicketsPage() {
  const cookieStore = await cookies()
  const supabase    = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: tickets, error: ticketsError } = await admin
    .from('tickets')
    .select('id, qr_hash, is_used, tier_id, event_id')
    .eq('owner_id', user.id)
    .order('id', { ascending: false })

  if (ticketsError) throw new Error(ticketsError.message)

  const tierIds  = [...new Set((tickets ?? []).map(t => t.tier_id))]
  const eventIds = [...new Set((tickets ?? []).map(t => t.event_id))]

  const [{ data: tiers }, { data: events }] = await Promise.all([
    tierIds.length
      ? admin.from('ticket_tiers').select('id, name, price').in('id', tierIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? admin.from('events').select('id, title, event_date, image_url, venue_id').in('id', eventIds)
      : Promise.resolve({ data: [] }),
  ])

  const venueIds = [...new Set((events ?? []).map(e => e.venue_id).filter(Boolean))] as string[]
  const { data: venues } = venueIds.length
    ? await admin.from('venues').select('id, name, city').in('id', venueIds)
    : { data: [] as { id: string; name: string; city: string }[] }

  const tierById  = new Map((tiers  ?? []).map(t => [t.id, t]))
  const venueById = new Map((venues ?? []).map(v => [v.id, v]))

  const eventGroups = (events ?? [])
    .map(event => {
      const venue      = event.venue_id ? (venueById.get(event.venue_id) ?? null) : null
      const imageUrl   = resolveEventImageUrl(admin, event.image_url)
      const groupTickets = (tickets ?? [])
        .filter(t => t.event_id === event.id)
        .map((t, i) => ({
          id:       t.id,
          qr_hash:  t.qr_hash,
          is_used:  t.is_used,
          tierName: tierById.get(t.tier_id)?.name ?? 'Boleto',
          price:    Number(tierById.get(t.tier_id)?.price ?? 0),
          index:    i + 1,
        }))

      return {
        eventData: {
          title:      event.title,
          date:       new Date(event.event_date).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          }),
          venueName:  venue?.name  ?? null,
          venueCity:  venue?.city  ?? null,
          imageUrl,
          totalCount: groupTickets.length,
          validCount: groupTickets.filter(t => !t.is_used).length,
        },
        tickets: groupTickets,
        eventDate: event.event_date,
      }
    })
    .filter(g => g.tickets.length > 0)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  const totalTickets = tickets?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Mis boletos</h1>
        <p className="text-zinc-500 mt-1">
          {totalTickets === 0
            ? 'Sin boletos aún'
            : `${totalTickets} boleto${totalTickets !== 1 ? 's' : ''} en ${eventGroups.length} evento${eventGroups.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {eventGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
          <Ticket size={40} className="mx-auto text-zinc-300 mb-3" />
          <p className="font-semibold text-zinc-700">No tienes boletos aún</p>
          <p className="text-sm text-zinc-400 mt-1">Explora los eventos disponibles y compra tus boletos</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            <FileSearch size={15} />
            Ver eventos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {eventGroups.map(({ eventData, tickets: groupTickets, eventDate }) => (
            <EventTicketCard
              key={eventDate + eventData.title}
              event={eventData}
              tickets={groupTickets}
            />
          ))}
        </div>
      )}
    </div>
  )
}
