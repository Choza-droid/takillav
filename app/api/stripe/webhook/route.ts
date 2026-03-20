import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'

function asRequiredMetadata(metadata: Stripe.Metadata | null) {
  const userId = metadata?.user_id?.trim()
  const tierId = metadata?.tier_id?.trim()
  const quantityRaw = Number(metadata?.quantity)
  const quantity = Number.isInteger(quantityRaw) ? quantityRaw : NaN

  if (!userId || !tierId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return null
  }

  return { userId, tierId, quantity }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const body = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'payment' && session.payment_status === 'paid') {
      const parsed = asRequiredMetadata(session.metadata)
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid checkout metadata' }, { status: 400 })
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : null

      const supabaseAdmin = createAdminClient()
      const { error } = await supabaseAdmin.rpc('fulfill_checkout_session', {
        p_user_id: parsed.userId,
        p_tier_id: parsed.tierId,
        p_quantity: parsed.quantity,
        p_session_id: session.id,
        p_payment_intent_id: paymentIntentId,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
