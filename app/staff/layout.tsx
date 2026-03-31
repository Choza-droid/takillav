import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Ticket, ScanLine, Users } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import FormButton from '@/components/form-button'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isOrganizerOrAdmin = profile?.role === 'organizer' || profile?.role === 'admin'

  let isTeamMember = false
  if (!isOrganizerOrAdmin) {
    const { data: teamEntry } = await supabase
      .from('team_members')
      .select('id')
      .eq('member_user_id', user.id)
      .limit(1)
      .single()
    isTeamMember = !!teamEntry
  }

  if (!isOrganizerOrAdmin && !isTeamMember) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="border-b border-zinc-800 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Ticket size={18} />
          Takilla Staff
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">{profile?.full_name}</span>
          <form action={logout}>
            <FormButton className="text-zinc-500 hover:text-white">
              Salir
            </FormButton>
          </form>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="border-t border-zinc-800 bg-zinc-950 flex">
        <Link href="/staff/team"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-zinc-500 hover:text-orange-400 transition-colors">
          <Users size={20} />
          <span className="text-xs">Eventos</span>
        </Link>
        <Link href="/staff"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-zinc-500 hover:text-orange-400 transition-colors">
          <ScanLine size={20} />
          <span className="text-xs">Escanear</span>
        </Link>
      </nav>
    </div>
  )
}