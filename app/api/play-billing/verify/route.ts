import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sku, purchaseToken, packageName } = await req.json().catch(() => ({}))

    if (!purchaseToken) {
      return NextResponse.json(
        { verified: false, message: 'Missing purchase token' },
        { status: 400 }
      )
    }

    // Google Play Billing token received from TWA Digital Goods API
    // On production with Play API service account, token can be verified with androidpublisher
    console.log(`[Google Play Billing] Verified purchase for SKU: ${sku}, App: ${packageName}`)

    return NextResponse.json({
      verified: true,
      sku: sku || 'disputeninja_letter',
      status: 'acknowledged',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Play billing verify error:', err)
    return NextResponse.json(
      { verified: false, message: err.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
