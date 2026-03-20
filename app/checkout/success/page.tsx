import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-zinc-200 p-8 space-y-4 text-center">
      <p className="text-sm font-semibold text-green-700">Pago iniciado correctamente</p>
      <h1 className="text-2xl font-bold text-zinc-900">Gracias por tu compra</h1>
      <p className="text-zinc-500">
        Stripe confirmó tu pago. Si tus boletos no aparecen de inmediato, refresca la página de tu dashboard.
      </p>
      <div className="pt-2">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition-colors"
        >
          Ir a mis boletos
        </Link>
      </div>
    </div>
  )
}
