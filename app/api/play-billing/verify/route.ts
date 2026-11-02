import { NextRequest, NextResponse } from 'next/server'
import { verifyPlayPurchase } from '@/lib/payments'

// Checks a Google Play purchase with Google itself, then acknowledges it.
// (Google automatically refunds purchases that are not acknowledged within about 3 days.)
export async function POST(req: NextRequest) {
  try {
    const { sku, purchaseToken } = await req.json().catch(() => ({}))
    const result = await verifyPlayPurchase(sku, purchaseToken, { acknowledge: true })
    if (!result.ok) {
      return NextResponse.json({ verified: false, message: result.reason }, { status: result.status })
    }
    return NextResponse.json({ verified: true, product: result.product, status: 'acknowledged' })
  } catch (err) {
    console.error('Play billing verify error:', err)
    return NextResponse.json({ verified: false, message: 'verification_failed' }, { status: 500 })
  }
}
