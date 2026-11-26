import { NextRequest, NextResponse } from 'next/server'
import { cleanAmount, cleanIdempotencyKey, cleanText, getStripe, safeOrigin } from '@/lib/payments'

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
    const disputeType = cleanText(body.disputeType, 20, 'debt')
    const creditorName = cleanText(body.creditorName, 120, 'Creditor')
    const disputedAmount = cleanAmount(body.disputedAmount, '0')
    const userName = cleanText(body.userName, 120)
    const accountNum = cleanText(body.accountNum, 60)
    const lang = body.lang === 'es' ? 'es' : 'en'
    const idempotencyKey = cleanIdempotencyKey(body.idempotencyKey || req.headers.get('x-idempotency-key'))

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
      return NextResponse.json({ error: 'Stripe checkout is not configured yet.' }, { status: 503 })
    }

    const origin = safeOrigin(req.headers.get('origin'))
    const unitAmount = isKit ? 1900 : 999
    const productName = isKit
      ? 'DisputeNinja — 5-Letter Dispute Kit'
      : 'DisputeNinja — Single Dispute Letter'
    const productDesc = isKit
      ? 'Five ready-to-edit federal dispute letter templates plus step-by-step action guide (digital download)'
      : `Single self-help dispute letter template for ${creditorName}`

    const successParams = new URLSearchParams({
      unlocked: 'true',
      type: disputeType,
      creditor: creditorName,
      amount: disputedAmount,
      lang,
    })
    if (userName) successParams.set('name', userName)
    if (accountNum) successParams.set('account', accountNum)

    const session = await stripe.checkout.sessions.create(
      {
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
        metadata: {
          disputeType,
          creditorName,
          disputedAmount,
          productType,
          ...(userName ? { userName } : {}),
          ...(accountNum ? { accountNum } : {}),
        },
        // The page asks the server "is session_id paid?" before it shows or sends anything.
        success_url: isKit
          ? `${origin}/?unlocked=kit&session_id={CHECKOUT_SESSION_ID}&lang=${lang}`
          : `${origin}/?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true&lang=${lang}`,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    )

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Checkout could not start. Please try again in a moment.' }, { status: 500 })
  }
}
