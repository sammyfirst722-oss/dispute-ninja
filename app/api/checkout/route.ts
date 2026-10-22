import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { disputeType = 'medical', creditorName = 'Creditor', disputedAmount = '0', productType = 'letter' } = await req.json().catch(() => ({}))
    const isKit = productType === 'kit'
    const rawKey = process.env.STRIPE_SECRET_KEY || ''
    const stripeKey = rawKey.trim().replace(/[\r\n"']/g, '')
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any })
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isKit ? 'Medical Bill & Debt Dispute Action Kit' : 'DisputeNinja AI — Document Generation & Audit Pack',
              description: isKit ? 'Complete 5-letter demand bundle + 205-line CPT audit & No Surprises Act guide' : `Full certified dispute demand for ${creditorName} (Claim: $${disputedAmount})`,
            },
            unit_amount: isKit ? 1900 : 999, // $19.00 kit or $9.99 single letter
          },
          quantity: 1,
        },
      ],
      metadata: { disputeType, creditorName, disputedAmount, productType },
      success_url: isKit
        ? `${origin}/?unlocked=kit`
        : `${origin}/?unlocked=true&type=${encodeURIComponent(disputeType)}&creditor=${encodeURIComponent(creditorName)}&amount=${encodeURIComponent(disputedAmount)}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
