'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import FormButton from '@/components/form-button'

type MenuItem = { label: string; href: string }

type Props = {
  userName: string
  roleLabel: string
  menuItems: MenuItem[]
}

export default function NavbarUserMenu({ userName, roleLabel, menuItems }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const id = setTimeout(() => {
      document.addEventListener('click', handler)
      document.addEventListener('touchend', handler)
    }, 10)
    return () => {
      clearTimeout(id)
      document.removeEventListener('click', handler)
      document.removeEventListener('touchend', handler)
    }
  }, [open])

  const shortName = userName.split(' ')[0] ?? userName

  return (
    <div ref={ref} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
        style={{
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 20px rgba(249,115,22,0.25)',
          maxWidth: '180px',
        }}
      >
        <span className="truncate">{shortName}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 overflow-hidden"
          style={{
            background: '#1e1d2a',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-orange)' }}>{roleLabel}</p>
          </div>

          {menuItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <form action={logout}>
              <FormButton className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={13} />
                Cerrar sesión
              </FormButton>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}