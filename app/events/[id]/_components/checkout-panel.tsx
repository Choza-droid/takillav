'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

type CheckoutPanelProps = {
  eventId: string
  tierId: string
  availableTickets: number
}

export default function CheckoutPanel({
  eventId,
  tierId,
  availableTickets,
}: CheckoutPanelProps) {
  const max = Math.min(availableTickets, 10)
  const [qty, setQty] = useState(1)

  return (
    <form action="/checkout" method="GET" className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="tierId" value={tierId} />
      <input type="hidden" name="quantity" value={qty} />

      {/* Quantity stepper */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 mr-auto">Cantidad</span>
        <button
          type="button"
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-semibold text-zinc-900 tabular-nums">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(q => Math.min(max, q + 1))}
          disabled={qty >= max}
          className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
      >
        Comprar {qty > 1 ? `${qty} boletos` : 'boleto'}
      </button>
    </form>
  )
}
