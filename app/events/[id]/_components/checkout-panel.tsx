'use client'

import { useMemo } from 'react'

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
  const maxSelectable = Math.max(1, Math.min(availableTickets, 10))

  const quantities = useMemo(() => {
    return Array.from({ length: maxSelectable }, (_, i) => i + 1)
  }, [maxSelectable])

  return (
    <form action="/checkout" method="GET" className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="tierId" value={tierId} />

      <div className="flex items-center gap-2">
        <label htmlFor={`qty-${tierId}`} className="text-sm text-zinc-500">
          Cantidad
        </label>
        <select
          id={`qty-${tierId}`}
          name="quantity"
          defaultValue="1"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {quantities.map(q => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
      >
        Ir a checkout
      </button>
    </form>
  )
}
