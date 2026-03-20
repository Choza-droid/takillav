'use client'

import { updateEventStatus } from '../actions'
import { Globe, FileText, XCircle } from 'lucide-react'

export default function StatusActions({
  eventId,
  currentStatus,
}: {
  eventId: string
  currentStatus: string
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus === 'draft' && (
        <form action={updateEventStatus.bind(null, eventId, 'published')}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Globe size={14} />
            Publicar evento
          </button>
        </form>
      )}

      {currentStatus === 'published' && (
        <form action={updateEventStatus.bind(null, eventId, 'draft')}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            <FileText size={14} />
            Volver a borrador
          </button>
        </form>
      )}

      {currentStatus !== 'cancelled' && (
        <form action={updateEventStatus.bind(null, eventId, 'cancelled')}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <XCircle size={14} />
            Cancelar evento
          </button>
        </form>
      )}
    </div>
  )
}
