// Server-side payment checks for DisputeNinja.
// Rule: nothing paid is delivered unless Stripe says the checkout session is PAID,
// or Google Play says the purchase token is a real PURCHASED item. Never trust the browser.
import Stripe from 'stripe'
import { createSign } from 'node:crypto'

export type ProductType = 'letter' | 'kit'

export const PLAY_PACKAGE = 'app.vercel.disputeninja.twa'
// 'mail' (USPS Certified Mail) is NOT sold: there is no fulfillment behind it yet.
export const PLAY_SKUS: Record<string, ProductType> = {
  disputeninja_letter: 'letter',
  disputeninja_kit: 'kit',
}

export type Entitlement =
  | { ok: true; product: ProductType; source: 'stripe' | 'play' }
  | { ok: false; status: number; reason: string }

const fail = (status: number, reason: string): Entitlement => ({ ok: false, status, reason })

export function getStripe(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/[\r\n"']/g, '')
  if (!key) return null
  return new Stripe(key, { apiVersion: '2024-04-10' as any })
}

const MAX_SESSION_AGE_SECONDS = 60 * 24 * 3600 // a paid session stays valid for 60 days

/** Ask Stripe whether this Checkout Session was really paid, and for which product. */
export async function verifyStripeSession(
  sessionId: unknown,
  stripe: Pick<Stripe, 'checkout'> | null = getStripe()
): Promise<Entitlement> {
  if (typeof sessionId !== 'string' || !/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    return fail(402, 'invalid_session')
  }
  if (!stripe) return fail(503, 'payments_not_configured')
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId)
    if (s.mode !== 'payment' || s.payment_status !== 'paid') return fail(402, 'not_paid')
    if (Math.floor(Date.now() / 1000) - s.created > MAX_SESSION_AGE_SECONDS) return fail(402, 'session_expired')
    const product = s.metadata?.productType
    if (product !== 'letter' && product !== 'kit') return fail(402, 'unsupported_product')
    return { ok: true, product, source: 'stripe' }
  } catch {
    return fail(402, 'session_not_found')
  }
}

// ---------- Google Play ----------
let cachedGoogleToken: { token: string; exp: number } | null = null

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function loadServiceAccount(): { client_email: string; private_key: string; token_uri?: string } | null {
  const raw = (process.env.PLAY_SERVICE_ACCOUNT_JSON || '').trim()
  if (!raw) return null
  try {
    const text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const sa = JSON.parse(text)
    return sa.client_email && sa.private_key ? sa : null
  } catch {
    return null
  }
}

async function getGoogleAccessToken(fetchImpl: typeof fetch): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedGoogleToken && cachedGoogleToken.exp - 60 > now) return cachedGoogleToken.token
  const sa = loadServiceAccount()
  if (!sa) return null
  const tokenUri = sa.token_uri || 'https://oauth2.googleapis.com/token'
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: tokenUri,
      iat: now,
      exp: now + 3300,
    })
  )
  const signature = b64url(createSign('RSA-SHA256').update(`${header}.${claims}`).sign(sa.private_key))
  const res = await fetchImpl(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  })
  if (!res.ok) return null
  const j = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!j.access_token) return null
  cachedGoogleToken = { token: j.access_token, exp: now + (j.expires_in || 3300) }
  return j.access_token
}

/**
 * Ask Google Play whether this purchase token is a real, completed purchase of this product.
 * With acknowledge=true it also acknowledges it (Google refunds unacknowledged purchases after ~3 days).
 */
export async function verifyPlayPurchase(
  sku: unknown,
  purchaseToken: unknown,
  opts: { acknowledge?: boolean; fetchImpl?: typeof fetch } = {}
): Promise<Entitlement> {
  const fetchImpl = opts.fetchImpl || fetch
  if (typeof sku !== 'string' || !(sku in PLAY_SKUS)) return fail(402, 'unknown_product')
  if (typeof purchaseToken !== 'string' || !/^[A-Za-z0-9._~\-]{20,2000}$/.test(purchaseToken)) {
    return fail(402, 'invalid_purchase_token')
  }
  let accessToken: string | null
  try {
    accessToken = await getGoogleAccessToken(fetchImpl)
  } catch {
    accessToken = null
  }
  if (!accessToken) return fail(503, 'play_verification_not_configured')

  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PLAY_PACKAGE}/purchases/products/${sku}/tokens/${encodeURIComponent(purchaseToken)}`
  const auth = { Authorization: `Bearer ${accessToken}` }
  let res: Response
  try {
    res = await fetchImpl(base, { headers: auth })
  } catch {
    return fail(503, 'play_api_unreachable')
  }
  if (res.status === 401 || res.status === 403) return fail(503, 'play_api_permission')
  if (!res.ok) return fail(402, 'purchase_not_found')
  const p = (await res.json()) as { purchaseState?: number; acknowledgementState?: number }
  if (p.purchaseState !== 0) return fail(402, 'purchase_not_completed') // 0 = purchased, 1 = canceled, 2 = pending

  if (opts.acknowledge && p.acknowledgementState === 0) {
    try {
      const ack = await fetchImpl(`${base}:acknowledge`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!ack.ok) return fail(502, 'acknowledge_failed')
    } catch {
      return fail(502, 'acknowledge_failed')
    }
  }
  return { ok: true, product: PLAY_SKUS[sku], source: 'play' }
}

/** Decide if a request body proves payment: a Stripe session id OR a Play purchase. */
export async function entitlementFromBody(body: any): Promise<Entitlement> {
  if (body && typeof body.sessionId === 'string') return verifyStripeSession(body.sessionId)
  if (body?.playPurchase) return verifyPlayPurchase(body.playPurchase.sku, body.playPurchase.purchaseToken)
  return fail(402, 'payment_required')
}

// ---------- small helpers ----------
const DEFAULT_ORIGIN = 'https://dispute-ninja.vercel.app'

/** Only send people back to our own site after checkout (never to an origin a caller invents). */
export function safeOrigin(origin: string | null): string {
  if (!origin) return DEFAULT_ORIGIN
  try {
    const u = new URL(origin)
    const okHost = u.hostname === 'dispute-ninja.vercel.app' || u.hostname === 'localhost' || /(^|\.)lowkeyaitech\.com$/.test(u.hostname)
    return okHost ? u.origin : DEFAULT_ORIGIN
  } catch {
    return DEFAULT_ORIGIN
  }
}

/** Trim and strip control characters from user text. */
export function cleanText(v: unknown, max: number, fallback = ''): string {
  if (typeof v !== 'string') return fallback
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) || fallback
}

/** Keep only a plain money-looking amount, otherwise use the fallback. */
export function cleanAmount(v: unknown, fallback = '0.00'): string {
  const s = typeof v === 'number' ? String(v) : typeof v === 'string' ? v.trim() : ''
  return /^[0-9][0-9,]{0,9}(\.[0-9]{1,2})?$/.test(s) ? s : fallback
}
