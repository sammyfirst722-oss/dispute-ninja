import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
    const { 
      disputeType = 'medical', 
      creditorName = 'Creditor', 
      disputedAmount = '0', 
      productType = 'letter', 
      isTwa = false,
      recipientAddress = '',
      senderAddress = ''
    } = await req.json().catch(() => ({}))

    // If client is in Android TWA and requested Play Billing, advise client to use Digital Goods API
    if (isAndroidTwa(req, isTwa)) {
      return NextResponse.json({
        isAndroidApp: true,
        usePlayBilling: true,
        sku: productType === 'kit' ? 'disputeninja_kit' : productType === 'mail' ? 'disputeninja_mail' : 'disputeninja_letter',
        message: 'Google Play in-app purchase available',
      })
    }

    const isKit = productType === 'kit'
    const isMail = productType === 'mail'
    const rawKey = process.env.STRIPE_SECRET_KEY || ''
    const stripeKey = rawKey.trim().replace(/[\r\n"']/g, '')
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any })
    const origin = req.headers.get('origin') || 'https://dispute-ninja.vercel.app'

    let unitAmount = 999
    let productName = 'DisputeNinja AI — Document Generation & Audit Pack'
    let productDesc = `Full certified dispute demand for ${creditorName} (Claim: $${disputedAmount})`

    if (isKit) {
      unitAmount = 1900
      productName = 'Medical Bill & Debt Dispute Action Kit'
      productDesc = 'Complete 5-letter demand bundle + 205-line CPT audit & No Surprises Act guide'
    } else if (isMail) {
      unitAmount = 1499
      productName = 'USPS Certified Mail & Print Service (with Tracking Number)'
      productDesc = `Official USPS Certified Mail with Return Receipt sent directly to ${creditorName}. Live tracking included.`
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDesc,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { 
        disputeType, 
        creditorName, 
        disputedAmount, 
        productType,
        recipientAddress,
        senderAddress
      },
      success_url: isKit
        ? `${origin}/?unlocked=kit`
        : isMail
        ? `${origin}/?unlocked=mail&creditor=${encodeURIComponent(creditorName)}`
        : `${origin}/?unlocked=true&type=${encodeURIComponent(disputeType)}&creditor=${encodeURIComponent(creditorName)}&amount=${encodeURIComponent(disputedAmount)}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
