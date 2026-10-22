'use client'

import React, { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export function StickyCheckoutCTA() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType: 'kit' }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Checkout failed to load')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 shadow-2xl z-50 flex justify-center">
      <div className="max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold">Ready to fight back?</h4>
          <p className="text-slate-400 text-sm">Download the complete 5-Letter Action Kit & Audit Pack instantly.</p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="whitespace-nowrap px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <span>{isLoading ? 'Loading Secure Checkout...' : 'Get the $19 Action Kit'}</span>
          {!isLoading && <Sparkles className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
