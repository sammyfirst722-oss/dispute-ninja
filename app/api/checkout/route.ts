import { NextRequest, NextResponse } from 'next/server'
import { cleanAmount, cleanText, getStripe, safeOrigin } from '@/lib/payments'

function isAndroidTwa(req: NextRequest, bodyIsTwa?: boolean): boolean {
  if (bodyIsTwa) return true
  const xRequestedWith = (req.headers.get('x-requested-with') || '').toLowerCase()
  if (xRequestedWith.includes('disputeninja') || xRequestedWith.includes('twa')) return true
  const referer = (req.headers.get('referer') || '').toLowerCase()
  if (referer.includes('android-app://')) return true
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const productType = cleanText(body.productType, 10, 'letter')
    const disputeType = cleanText(body.disputeType, 20, 'medical')
    const creditorName = cleanText(body.creditorName, 120, 'Creditor')
    const disputedAmount = cleanAmount(body.disputedAmount, '0')

    // USPS Certified Mail is switched off: nothing mails letters yet, so we must not sell it.
    if (productType !== 'letter' && productType !== 'kit') {
      return NextResponse.json(
        { error: 'This product is not available yet.' },
        { status: 400 }
      )
    }
    const isKit = productType === 'kit'

    // Android app: tell the app to use Google Play billing instead of Stripe.
    if (isAndroidTwa(req, body.isTwa === true)) {
      return NextResponse.json({
        isAndroidApp: true,
        usePlayBilling: true,
        sku: isKit ? 'disputeninja_kit' : 'disputeninja_letter',
        message: 'Google Play in-app purchase available',
      })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
    }

    const origin = safeOrigin(req.headers.get('origin'))
    const unitAmount = isKit ? 1900 : 999
    const productName = isKit ? 'Medical Bill & Debt Dispute Action Kit' : 'DisputeNinja AI — Document Generation & Audit Pack'
    const productDesc = isKit
      ? 'Five ready-to-edit dispute letters plus a step-by-step action guide'
      : `Dispute demand letter for ${creditorName}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName, description: productDesc },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { disputeType, creditorName, disputedAmount, productType },
      // The page asks the server "is session_id paid?" before it shows or sends anything.
      success_url: isKit
        ? `${origin}/?unlocked=kit&session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/?unlocked=true&session_id={CHECKOUT_SESSION_ID}&type=${encodeURIComponent(disputeType)}&creditor=${encodeURIComponent(creditorName)}&amount=${encodeURIComponent(disputedAmount)}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
