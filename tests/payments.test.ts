import { describe, it, expect, beforeAll, vi } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'
import {
  verifyStripeSession,
  verifyPlayPurchase,
  entitlementFromBody,
  cleanText,
  cleanAmount,
  safeOrigin,
} from '@/lib/payments'

const GOOD_ID = 'cs_live_a1B2c3D4e5F6g7H8i9J0'
const now = () => Math.floor(Date.now() / 1000)

function fakeStripe(session: any, opts: { throws?: boolean } = {}) {
  return {
    checkout: {
      sessions: {
        retrieve: vi.fn(async () => {
          if (opts.throws) throw new Error('No such session')
          return session
        }),
      },
    },
  } as any
}

describe('verifyStripeSession (Stripe says paid)', () => {
  it('accepts a paid letter session', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now(), metadata: { productType: 'letter' } }))
    expect(r).toMatchObject({ ok: true, product: 'letter', source: 'stripe' })
  })
  it('hands back what the buyer entered at checkout, cleaned (so the letter is tied to that dispute)', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now(), metadata: { productType: 'letter', disputeType: 'debt', creditorName: '  Midland Credit  ', disputedAmount: '1,450.00' } }))
    expect(r.ok && r.meta).toEqual({ disputeType: 'debt', creditorName: 'Midland Credit', disputedAmount: '1,450.00' })
    const bad = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now(), metadata: { productType: 'letter', disputedAmount: '<script>' } }))
    expect(bad.ok && bad.meta?.disputedAmount).toBe('')
  })
  it('accepts a paid kit session', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now(), metadata: { productType: 'kit' } }))
    expect(r.ok && r.product).toBe('kit')
  })
  it('rejects an unpaid session', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'unpaid', created: now(), metadata: { productType: 'letter' } }))
    expect(r).toMatchObject({ ok: false, status: 402, reason: 'not_paid' })
  })
  it('rejects a subscription-mode session', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'subscription', payment_status: 'paid', created: now(), metadata: { productType: 'letter' } }))
    expect(r.ok).toBe(false)
  })
  it('rejects the retired mail product and unknown products', async () => {
    for (const p of ['mail', 'free', undefined]) {
      const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now(), metadata: { productType: p } }))
      expect(r).toMatchObject({ ok: false, reason: 'unsupported_product' })
    }
  })
  it('rejects a session older than 30 days', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now() - 31 * 24 * 3600, metadata: { productType: 'letter' } }))
    expect(r).toMatchObject({ ok: false, reason: 'session_expired' })
    const ok = await verifyStripeSession(GOOD_ID, fakeStripe({ mode: 'payment', payment_status: 'paid', created: now() - 29 * 24 * 3600, metadata: { productType: 'letter' } }))
    expect(ok.ok).toBe(true)
  })
  it('rejects ids that are not Stripe checkout ids (no Stripe call made)', async () => {
    const stripe = fakeStripe({})
    for (const bad of [undefined, null, 123, '', 'true', 'cs_live_', 'cs_test_x', '../etc/passwd', 'unlocked']) {
      expect(await verifyStripeSession(bad as any, stripe)).toMatchObject({ ok: false, status: 402 })
    }
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
  })
  it('rejects when Stripe does not know the session', async () => {
    const r = await verifyStripeSession(GOOD_ID, fakeStripe({}, { throws: true }))
    expect(r).toMatchObject({ ok: false, status: 402, reason: 'session_not_found' })
  })
  it('fails closed (503) when Stripe is not configured', async () => {
    const r = await verifyStripeSession(GOOD_ID, null)
    expect(r).toMatchObject({ ok: false, status: 503 })
  })
})

describe('verifyPlayPurchase (Google Play says purchased)', () => {
  const TOKEN = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let calls: { url: string; method: string }[]

  beforeAll(() => {
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    })
    process.env.PLAY_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: 'test@example.iam.gserviceaccount.com',
      private_key: privateKey,
      token_uri: 'https://oauth.test/token',
    })
  })

  function fakeFetch(opts: { state?: number; ack?: number; status?: number; ackOk?: boolean }) {
    calls = []
    return (async (url: any, init?: any) => {
      const u = String(url)
      calls.push({ url: u, method: init?.method || 'GET' })
      if (u === 'https://oauth.test/token') return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 })
      if (u.endsWith(':acknowledge')) return opts.ackOk === false ? new Response('{}', { status: 500 }) : new Response(null, { status: 204 })
      return new Response(JSON.stringify({ purchaseState: opts.state ?? 0, acknowledgementState: opts.ack ?? 0 }), { status: opts.status ?? 200 })
    }) as unknown as typeof fetch
  }

  it('accepts a real purchase and acknowledges it', async () => {
    const r = await verifyPlayPurchase('disputeninja_letter', TOKEN, { acknowledge: true, fetchImpl: fakeFetch({}) })
    expect(r).toEqual({ ok: true, product: 'letter', source: 'play' })
    expect(calls.some((c) => c.url.endsWith(':acknowledge') && c.method === 'POST')).toBe(true)
  })
  it('does not acknowledge twice', async () => {
    await verifyPlayPurchase('disputeninja_kit', TOKEN, { acknowledge: true, fetchImpl: fakeFetch({ ack: 1 }) })
    expect(calls.some((c) => c.url.endsWith(':acknowledge'))).toBe(false)
  })
  it('rejects canceled or pending purchases', async () => {
    for (const state of [1, 2]) {
      const r = await verifyPlayPurchase('disputeninja_letter', TOKEN, { fetchImpl: fakeFetch({ state }) })
      expect(r).toMatchObject({ ok: false, reason: 'purchase_not_completed' })
    }
  })
  it('rejects a token Google does not know', async () => {
    const r = await verifyPlayPurchase('disputeninja_letter', TOKEN, { fetchImpl: fakeFetch({ status: 404 }) })
    expect(r).toMatchObject({ ok: false, status: 402, reason: 'purchase_not_found' })
  })
  it('reports a permission problem as 503, not as a fake success', async () => {
    const r = await verifyPlayPurchase('disputeninja_letter', TOKEN, { fetchImpl: fakeFetch({ status: 403 }) })
    expect(r).toMatchObject({ ok: false, status: 503, reason: 'play_api_permission' })
  })
  it('fails when acknowledging fails (so the app retries)', async () => {
    const r = await verifyPlayPurchase('disputeninja_letter', TOKEN, { acknowledge: true, fetchImpl: fakeFetch({ ackOk: false }) })
    expect(r).toMatchObject({ ok: false, status: 502 })
  })
  it('rejects unknown products (including mail) and malformed tokens before calling Google', async () => {
    const f = fakeFetch({})
    expect(await verifyPlayPurchase('disputeninja_mail', TOKEN, { fetchImpl: f })).toMatchObject({ ok: false, reason: 'unknown_product' })
    expect(await verifyPlayPurchase('disputeninja_letter', 'short', { fetchImpl: f })).toMatchObject({ ok: false, reason: 'invalid_purchase_token' })
    expect(await verifyPlayPurchase('disputeninja_letter', 'has spaces and symbols !!!!!!!!', { fetchImpl: f })).toMatchObject({ ok: false })
    expect(calls.length).toBe(0)
  })
  it('a well-formed but made-up token is still rejected, because Google does not know it', async () => {
    const r = await verifyPlayPurchase('disputeninja_letter', 'twa_play_token_1730000000000', { fetchImpl: fakeFetch({ status: 404 }) })
    expect(r).toMatchObject({ ok: false, status: 402, reason: 'purchase_not_found' })
  })
})

describe('Play purchases are acknowledged before anything is delivered', () => {
  it('entitlementFromBody acknowledges a not-yet-acknowledged purchase (through the real global fetch)', async () => {
    const TOKEN = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const seen: string[] = []
    const realFetch = globalThis.fetch
    globalThis.fetch = (async (url: any, init?: any) => {
      const u = String(url); seen.push((init?.method || 'GET') + ' ' + u)
      if (u.includes('oauth')) return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 })
      if (u.endsWith(':acknowledge')) return new Response(null, { status: 204 })
      return new Response(JSON.stringify({ purchaseState: 0, acknowledgementState: 0 }), { status: 200 })
    }) as typeof fetch
    try {
      const r = await entitlementFromBody({ playPurchase: { sku: 'disputeninja_letter', purchaseToken: TOKEN } })
      expect(r).toMatchObject({ ok: true, product: 'letter', source: 'play' })
      expect(seen.some((s) => s.startsWith('POST ') && s.endsWith(':acknowledge'))).toBe(true)
    } finally {
      globalThis.fetch = realFetch
    }
  })
})

describe('entitlementFromBody', () => {
  it('requires payment when nothing is supplied', async () => {
    expect(await entitlementFromBody({})).toMatchObject({ ok: false, status: 402, reason: 'payment_required' })
    expect(await entitlementFromBody(null)).toMatchObject({ ok: false, status: 402 })
  })
  it('does not accept the old ?unlocked=true style flags', async () => {
    expect(await entitlementFromBody({ unlocked: true, disputeType: 'debt' })).toMatchObject({ ok: false, status: 402 })
  })
})

describe('input helpers', () => {
  it('cleanText trims, limits and strips control characters', () => {
    expect(cleanText('  hi\u0000there  ', 20)).toBe('hithere')
    expect(cleanText('x'.repeat(500), 10)).toHaveLength(10)
    expect(cleanText(42, 10, 'fallback')).toBe('fallback')
  })
  it('cleanAmount only keeps money-looking values', () => {
    expect(cleanAmount('1,450.50')).toBe('1,450.50')
    expect(cleanAmount('<script>')).toBe('0.00')
    expect(cleanAmount(250)).toBe('250')
  })
  it('safeOrigin only returns our own sites', () => {
    expect(safeOrigin('https://evil.example')).toBe('https://dispute-ninja.vercel.app')
    expect(safeOrigin(null)).toBe('https://dispute-ninja.vercel.app')
    expect(safeOrigin('https://dispute-ninja.vercel.app')).toBe('https://dispute-ninja.vercel.app')
    expect(safeOrigin('http://localhost:3000')).toBe('http://localhost:3000')
    expect(safeOrigin('https://dispute.lowkeyaitech.com')).toBe('https://dispute.lowkeyaitech.com')
  })
})
