'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text, label = 'Copy sample' }: { text: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('failed')
      setTimeout(() => setStatus('idle'), 3500)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleCopy}
        type="button"
        className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white cursor-pointer dn-pressable"
      >
        {status === 'copied' ? (
          <Check className="h-4 w-4 text-emerald-300 shrink-0" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 text-sky-300 shrink-0" aria-hidden="true" />
        )}
        <span>
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Select text to copy' : label}
        </span>
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {status === 'copied' ? 'Sample text copied to clipboard.' : status === 'failed' ? 'Automatic copy failed. Select the text below to copy.' : ''}
      </span>
    </div>
  )
}
