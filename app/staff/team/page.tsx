import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ScanLine, CalendarDays, MapPin, Ticket } from 'lucide-react'

export default async function StaffTeamPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOrganizerOrAdmin = profile?.role === 'organizer' || profile?.role === 'admin'

  let assignments: {
    id: string
    eventId: string
    eventTitle: string
    eventDate: string
    venueName: string | null
    venueCity: string | null
    status: string
  }[] = []

  if (isOrganizerOrAdmin) {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, event_date, status, venues(name, city)')
      .eq('organizer_id', user.id)
      .eq('status', 'published')
      .order('event_date')

    assignments = (events ?? []).map(e => ({
      id: e.id,
      eventId: e.id,
      eventTitle: e.title,
      eventDate: e.event_date,
      venueName: (e.venues as { name?: string } | null)?.name ?? null,
      venueCity: (e.venues as { city?: string } | null)?.city ?? null,
      status: e.status,
    }))
  } else {
    const { data: teamEntries } = await supabase
      .from('team_members')
      .select('id, event_id, events(id, title, event_date, status, venues(name, city))')
      .eq('member_user_id', user.id)

    assignments = (teamEntries ?? []).map(t => {
      const e = t.events as { id?: string; title?: string; event_date?: string; status?: string; venues?: { name?: string; city?: string } | null } | null
      return {
        id: t.id,
        eventId: e?.id ?? '',
        eventTitle: e?.title ?? '—',
        eventDate: e?.event_date ?? '',
        venueName: e?.venues?.name ?? null,
        venueCity: e?.venues?.city ?? null,
        status: e?.status ?? '—',
      }
    }).filter(a => a.status === 'published')
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-8 gap-6 max-w-lg mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Mis eventos</h1>
        <p className="text-sm text-zinc-500">
          {assignments.length > 0
            ? `${assignments.length} evento${assignments.length !== 1 ? 's' : ''} con acceso activo`
            : 'No tienes eventos asignados'}
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Ticket size={28} className="text-zinc-600" />
          </div>
          <div>
            <p className="font-semibold text-zinc-300">Sin eventos asignados</p>
            <p className="text-sm text-zinc-600 mt-1">
              Pide al organizador que te asigne a un evento
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map(a => (
            <Link
              key={a.id}
              href={`/staff?event=${a.eventId}`}
              className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-orange-500/60 hover:bg-zinc-900/80 transition-all"
            >
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <p className="font-bold text-white text-base truncate group-hover:text-orange-400 transition-colors">
                  {a.eventTitle}
                </p>
                <div className="flex flex-col gap-1">
                  {a.eventDate && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <CalendarDays size={11} className="text-zinc-600" />
                      {new Date(a.eventDate).toLocaleDateString('es-MX', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  )}
                  {a.venueName && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin size={11} className="text-zinc-600" />
                      {a.venueName}, {a.venueCity}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all">
                <ScanLine size={18} />
                <span className="text-xs font-semibold">Escanear</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}