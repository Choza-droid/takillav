'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEvent } from '../actions'

type Venue = { id: string; name: string; city: string }

export default function EventForm({ venues }: { venues: Venue[] }) {
  const [state, action, pending] = useActionState(createEvent, null)

  return (
    <form action={action} className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Concierto de Rock en el Parque"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Describe el evento..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
        />
      </div>

      {/* Date + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-zinc-700 mb-1">
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input
            id="event_date"
            name="event_date"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-1">
            Estado inicial
          </label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      {/* Venue */}
      <div>
        <label htmlFor="venue_id" className="block text-sm font-medium text-zinc-700 mb-1">
          Venue
        </label>
        <select
          id="venue_id"
          name="venue_id"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        >
          <option value="">Sin venue asignado</option>
          {venues.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.city}
            </option>
          ))}
        </select>
        {venues.length === 0 && (
          <p className="text-xs text-zinc-400 mt-1">No hay venues registrados aún (el admin los crea).</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-zinc-700 mb-1">
          URL de imagen del evento
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      {/* Error */}
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/events"
          className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Creando...' : 'Crear evento'}
        </button>
      </div>

    </form>
  )
}
