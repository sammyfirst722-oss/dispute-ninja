import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { verifyPlayPurchase, verifyStripeSession, type Entitlement } from '@/lib/payments'

// The paid "Action Kit" zip is stored OUTSIDE /public and only sent after Stripe (web) or
// Google Play (Android app) confirms payment for the KIT product.
async function sendKit(ent: Entitlement) {
  if (!ent.ok) {
    return NextResponse.json({ error: 'payment_required', reason: ent.reason }, { status: ent.status })
  }
  if (ent.product !== 'kit') {
    return NextResponse.json({ error: 'payment_required', reason: 'wrong_product' }, { status: 402 })
  }
  try {
    const file = await readFile(path.join(process.cwd(), 'private', 'debt-dispute-action-kit.zip'))
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="debt-dispute-action-kit.zip"',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    console.error('Kit file missing:', err)
    return NextResponse.json({ error: 'kit_unavailable' }, { status: 500 })
  }
}

// Web: Stripe sends the buyer back with ?session_id=...
export async function GET(req: NextRequest) {
  return sendKit(await verifyStripeSession(req.nextUrl.searchParams.get('session_id')))
}

// Android app: the app posts the Google Play purchase for the server to check.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  return sendKit(await verifyPlayPurchase(body?.playPurchase?.sku, body?.playPurchase?.purchaseToken))
}
