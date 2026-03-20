'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Ticket, CalendarDays, MapPin, X } from 'lucide-react'
import TicketQr from './ticket-qr'

type TicketItem = {
  id: string
  qr_hash: string
  is_used: boolean
  tierName: string
  price: number
  index: number
}

type Props = {
  event: {
    title: string
    date: string
    venueName: string | null
    venueCity: string | null
    imageUrl: string | null
    totalCount: number
    validCount: number
  }
  tickets: TicketItem[]
}

export default function EventTicketCard({ event, tickets }: Props) {
  const [open, setOpen]                   = useState(false)
  const [scanning, setScanning]           = useState<TicketItem | null>(null)

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {/* Header — siempre visible, clickeable */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-start gap-4 p-5 text-left hover:bg-zinc-50 transition-colors"
        >
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={80}
              height={80}
              unoptimized
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
              <Ticket size={24} className="text-zinc-300" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold text-zinc-900 text-base leading-snug">{event.title}</h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  {event.totalCount} boleto{event.totalCount !== 1 ? 's' : ''}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            <div className="mt-2 space-y-1 text-sm text-zinc-500">
              <p className="flex items-center gap-1.5 capitalize">
                <CalendarDays size={13} />
                {event.date}
              </p>
              {event.venueName && (
                <p className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {event.venueName}, {event.venueCity}
                </p>
              )}
            </div>

            {event.validCount > 0 && (
              <p className="mt-2 text-xs font-semibold text-green-700">
                {event.validCount} válido{event.validCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </button>

        {/* Grid de cartas de boletos */}
        {open && (
          <div className="border-t border-zinc-100 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setScanning(ticket)}
                className={`rounded-xl border p-4 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md hover:border-zinc-300 active:scale-95 ${
                  ticket.is_used
                    ? 'border-zinc-200 bg-zinc-50 opacity-60'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <TicketQr qrHash={ticket.qr_hash} size={120} />

                <div className="w-full space-y-1">
                  <p className="font-semibold text-zinc-900 text-sm">
                    {ticket.tierName}{' '}
                    <span className="text-zinc-400 font-normal">#{ticket.index}</span>
                  </p>
                  <p className="text-sm font-bold text-zinc-900">
                    {ticket.price === 0 ? 'Gratis' : `$${ticket.price.toFixed(2)}`}
                  </p>
                </div>

                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  ticket.is_used
                    ? 'bg-zinc-100 text-zinc-400'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {ticket.is_used ? 'Usado' : 'Válido'}
                </span>

                <p className="text-[11px] text-zinc-400">Toca para escanear</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vista fullscreen para escaneo */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 gap-6">
          <button
            onClick={() => setScanning(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <X size={20} className="text-zinc-700" />
          </button>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              {event.title}
            </p>
            <p className="text-lg font-bold text-zinc-900">
              {scanning.tierName} #{scanning.index}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-zinc-200 shadow-sm">
            <TicketQr qrHash={scanning.qr_hash} size={240} />
          </div>

          <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
            scanning.is_used
              ? 'bg-zinc-100 text-zinc-500'
              : 'bg-green-100 text-green-700'
          }`}>
            {scanning.is_used ? 'Boleto ya utilizado' : '✓ Boleto válido'}
          </span>

          <p className="text-xs text-zinc-400 text-center max-w-xs">
            Muestra este código al staff en la entrada del evento
          </p>
        </div>
      )}
    </>
  )
}
