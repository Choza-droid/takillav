'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Ticket, CalendarDays, MapPin, X,
  ChevronLeft, ChevronRight, FileSearch,
} from 'lucide-react'
import { VT323 } from 'next/font/google'
import TicketQr from './ticket-qr'

const vt323 = VT323({ weight: '400', subsets: ['latin'] })

type TicketItem = {
  id: string
  qr_hash: string
  is_used: boolean
  tierName: string
  price: number
  index: number
}

type EventGroup = {
  eventData: {
    title: string
    date: string
    venueName: string | null
    venueCity: string | null
    imageUrl: string | null
    totalCount: number
    validCount: number
  }
  tickets: TicketItem[]
  eventDate: string
}

function ticketDisplayNumber(id: string): string {
  const hex = id.replace(/-/g, '').slice(0, 8)
  return String((parseInt(hex, 16) % 9000) + 1000)
}

export default function TicketsClient({ eventGroups }: { eventGroups: EventGroup[] }) {
  const [selected, setSelected] = useState<EventGroup | null>(null)
  const [ticketIndex, setTicketIndex] = useState(0)

  const openWallet = (group: EventGroup) => {
    setTicketIndex(0)
    setSelected(group)
  }

  const closeWallet = () => setSelected(null)

  if (eventGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center animate-fade-in-up">
        <Ticket size={40} className="mx-auto text-zinc-300 mb-3" />
        <p className="font-semibold text-zinc-700">No tienes boletos aún</p>
        <p className="text-sm text-zinc-400 mt-1">Explora los eventos disponibles y compra tus boletos</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FileSearch size={15} />
          Ver eventos
        </Link>
      </div>
    )
  }

  const ticket = selected?.tickets[ticketIndex]
  const total = selected?.tickets.length ?? 0

  return (
    <>
      {/* ── Event list ── */}
      <div className="space-y-3">
        {eventGroups.map((group, i) => {
          const { eventData } = group
          const isPast = new Date(group.eventDate) < new Date()

          return (
            <button
              key={group.eventDate + eventData.title}
              onClick={() => openWallet(group)}
              className="w-full text-left flex items-center gap-4 bg-white border border-zinc-200 rounded-2xl p-4 hover:border-zinc-400 hover:shadow-sm transition-all animate-fade-in-up group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                {eventData.imageUrl ? (
                  <Image
                    src={eventData.imageUrl}
                    alt={eventData.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center">
                    <Ticket size={22} className="text-white/60" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-bold text-zinc-900 leading-snug truncate group-hover:text-zinc-700 transition-colors">
                  {eventData.title}
                </p>
                <p className="text-sm text-zinc-500 flex items-center gap-1.5 capitalize">
                  <CalendarDays size={12} />
                  {eventData.date}
                </p>
                {eventData.venueName && (
                  <p className="text-sm text-zinc-500 flex items-center gap-1.5 truncate">
                    <MapPin size={12} />
                    {eventData.venueName}{eventData.venueCity ? `, ${eventData.venueCity}` : ''}
                  </p>
                )}
              </div>

              {/* Right badges */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                  {eventData.totalCount} boleto{eventData.totalCount !== 1 ? 's' : ''}
                </span>
                {isPast ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-400">
                    Pasado
                  </span>
                ) : eventData.validCount > 0 ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    {eventData.validCount} válido{eventData.validCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-400">
                    Usados
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Wallet overlay — rendered ONCE at the top level ── */}
      {selected && ticket && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-start sm:justify-center pt-16 sm:pt-0 px-5 pb-8 gap-5 overflow-y-auto">

          {/* Close */}
          <button
            onClick={closeWallet}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={20} />
          </button>

          {/* Retro ticket */}
          <div className={`w-full max-w-sm border-4 border-black bg-amber-50 shadow-[8px_8px_0_0_#000] ${vt323.className}`}>

            {/* Header */}
            <div className="bg-black text-amber-50 px-5 py-2.5 flex items-center justify-between">
              <span className="text-2xl tracking-[0.3em] uppercase">★ TAKILLA ★</span>
              <div className="flex items-center gap-3">
                <span className="text-xl tracking-widest opacity-70">
                  #{ticketDisplayNumber(ticket.id)}
                </span>
                {ticket.is_used && (
                  <span className="text-xs bg-zinc-600 text-zinc-300 px-2 py-0.5 uppercase tracking-wider">
                    Usado
                  </span>
                )}
              </div>
            </div>

            {/* Event info */}
            <div className="px-5 pt-4 pb-3 space-y-1.5">
              <p className="text-3xl text-zinc-900 uppercase tracking-wide leading-snug">
                {selected.eventData.title}
              </p>
              <p className="text-lg text-zinc-600 flex items-center gap-1.5 capitalize">
                <CalendarDays size={14} />
                {selected.eventData.date}
              </p>
              {selected.eventData.venueName && (
                <p className="text-lg text-zinc-600 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {selected.eventData.venueName}
                  {selected.eventData.venueCity ? ` — ${selected.eventData.venueCity}` : ''}
                </p>
              )}
              <p className="text-lg uppercase text-zinc-700">
                {ticket.tierName}
                {ticket.price > 0 && (
                  <span className="ml-2 text-zinc-400">· ${ticket.price.toFixed(2)}</span>
                )}
              </p>
            </div>

            {/* Dashed separator */}
            <div className="relative flex items-center my-2">
              <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-zinc-800 border-4 border-black" />
              <div className="flex-1 border-t-[3px] border-dashed border-black mx-5" />
              <div className="absolute -right-[18px] w-9 h-9 rounded-full bg-zinc-800 border-4 border-black" />
            </div>

            {/* QR — always visible */}
            <div className={`px-5 py-5 flex flex-col items-center gap-2 ${ticket.is_used ? 'opacity-40' : ''}`}>
              <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase self-start">
                Código de acceso
              </p>
              <TicketQr qrHash={ticket.qr_hash} size={220} />
              <p className="text-base text-zinc-400 tracking-widest uppercase">
                {ticket.is_used ? 'Este boleto ya fue usado' : 'Muestra al staff en la entrada'}
              </p>
            </div>
          </div>

          {/* Navigation — only when multiple tickets for this event */}
          {total > 1 && (
            <>
              <div className={`flex items-center gap-4 ${vt323.className}`}>
                <button
                  onClick={() => setTicketIndex(i => i - 1)}
                  disabled={ticketIndex === 0}
                  className="w-10 h-10 border-2 border-white/40 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {selected.tickets.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTicketIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${
                        i === ticketIndex ? 'bg-white' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setTicketIndex(i => i + 1)}
                  disabled={ticketIndex === total - 1}
                  className="w-10 h-10 border-2 border-white/40 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <p className={`text-sm text-white/50 tracking-widest uppercase ${vt323.className}`}>
                Boleto {ticketIndex + 1} de {total}
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
