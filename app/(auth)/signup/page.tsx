'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import FormButton from '@/components/form-button'

export default function SignupPage() {
  const [state, action] = useActionState(signup, null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6">Crear cuenta</h2>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700 mb-1">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            placeholder="Juan PÃ©rez"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
            Correo electrÃ³nico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
            ContraseÃ±a
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            placeholder="MÃ­nimo 6 caracteres"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <FormButton className="rounded-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-700 px-8 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:via-pink-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            Crear cuenta
          </FormButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Â¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
          Inicia sesiÃ³n
        </Link>
      </p>
    </div>
  )
}
