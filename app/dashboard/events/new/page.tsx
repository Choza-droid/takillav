import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import EventEditForm from '../[id]/_components/event-edit-form'
import { createEventWithInfo } from './actions'

export default async function NewEventPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, terms_accepted_at')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'organizer' && profile?.role !== 'admin') redirect('/dashboard')
  if (!profile?.terms_accepted_at) redirect('/dashboard/onboarding')

  const defaultDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={14} />
        Mis eventos
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-purple-900/40 text-purple-300 border border-purple-700/50 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Borrador
          </span>
          <span className="flex items-center gap-1 text-xs text-orange-400">
            <Pencil size={11} /> Modo edición activo
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Nuevo evento</h1>
      </div>

      {/* Form */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Pencil size={15} className="text-orange-400" />
          <h2 className="text-base font-semibold text-white">Editar información</h2>
        </div>

        <EventEditForm
          action={createEventWithInfo}
          defaultValues={{
            title:       'Nuevo evento',
            description: '',
            event_date:  defaultDate,
            status:      'draft',
            category:    'otro',
          }}
          submitLabel="Continuar → Agregar boletos"
        />

        {/* Submit button — se conecta al form por id */}
        <div className="bg-white/5 rounded-2xl border border-purple-700/40 p-5">
          <button
            type="submit"
            form="event-edit-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent-gradient)' }}
          >
            Continuar → Agregar boletos
          </button>
        </div>
      </section>

    </div>
  )
}