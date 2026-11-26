'use client'

import React, { useRef, useState } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { isAndroidApp } from '@/lib/play-billing'

export function StickyCheckoutCTA() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inFlightRef = useRef(false)
  const keyRef = useRef<string | null>(null)

  const handleCheckout = async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setIsLoading(true)
    setError('')

    if (!keyRef.current) {
      const rand =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID().replace(/-/g, '')
          : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      keyRef.current = `dn_kit_${rand}`.slice(0, 64)
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': keyRef.current,
        },
        body: JSON.stringify({
          productType: 'kit',
          idempotencyKey: keyRef.current,
          isTwa: isAndroidApp(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setError(data.error || 'Checkout could not start right now. Please try again.')
    } catch {
      setError('Connection error starting checkout. No charge was made — please try again.')
    } finally {
      inFlightRef.current = false
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-2xl bg-slate-900 border border-emerald-500/50 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-white">5-Letter Dispute Kit — $19 one-time</h2>
          <p className="text-sm text-slate-200">
            Includes 5 federal self-help letter templates plus a step-by-step action guide (digital ZIP download, no subscription, not legal advice).
          </p>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading}
          className="min-h-[48px] whitespace-nowrap px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60 dn-pressable"
        >
          <span>{isLoading ? 'Opening Stripe checkout...' : 'Get 5-Letter Kit — $19'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </section>
  )
}
