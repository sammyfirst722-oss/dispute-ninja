'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Phone, SlidersHorizontal, X } from 'lucide-react'

type TextSize = 'normal' | 'large'

interface DisplayPrefs {
  textSize: TextSize
  reducedMotion: boolean
}

const PREFS_KEY = 'disputeninja-display-prefs-v1'

export function SiteHeader() {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [textSize, setTextSize] = useState<TextSize>('normal')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [osReducedMotion, setOsReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setOsReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches)
    mq.addEventListener?.('change', onChange)

    try {
      const raw = localStorage.getItem(PREFS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DisplayPrefs>
        if (parsed.textSize === 'large' || parsed.textSize === 'normal') {
          setTextSize(parsed.textSize)
          document.documentElement.dataset.textSize = parsed.textSize
        }
        if (typeof parsed.reducedMotion === 'boolean') {
          setReducedMotion(parsed.reducedMotion)
          document.documentElement.dataset.reducedMotion = String(parsed.reducedMotion)
        }
      }
    } catch {}

    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Pointer-position light-dismiss fallback for browsers without native dialog closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return
    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect()
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    }
    let pressedOutside = false
    const onDown = (e: PointerEvent) => { pressedOutside = outside(e) }
    const onUp = (e: PointerEvent) => { if (pressedOutside && outside(e)) dialog.close() }
    dialog.addEventListener('pointerdown', onDown)
    dialog.addEventListener('pointerup', onUp)
    return () => {
      dialog.removeEventListener('pointerdown', onDown)
      dialog.removeEventListener('pointerup', onUp)
    }
  }, [])

  const savePrefs = (next: DisplayPrefs) => {
    setTextSize(next.textSize)
    setReducedMotion(next.reducedMotion)
    document.documentElement.dataset.textSize = next.textSize
    document.documentElement.dataset.reducedMotion = String(next.reducedMotion)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
    } catch {}
  }

  const openDisplayDialog = () => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }

  const navItems = [
    { href: '/', label: 'Dispute Tool' },
    { href: '/debt-rights', label: 'State Rights' },
    { href: '/dispute/debt-collector-validation-letter', label: 'Guides' },
  ]

  return (
    <>
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      <header className="border-b border-slate-800 bg-slate-950/95 no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-1 text-white font-black text-base tracking-tight hover:text-emerald-300 dn-pressable"
          >
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>DisputeNinja</span>
          </Link>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href.split('/').slice(0, 2).join('/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold dn-pressable ${
                    active
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:5203571814"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm font-semibold text-emerald-300 hover:bg-slate-800 hover:text-emerald-200 dn-pressable"
            >
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Hotline (520) 357-1814</span>
            </a>

            <button
              type="button"
              onClick={openDisplayDialog}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer dn-pressable"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Display</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-labelledby="display-prefs-title"
        {...({ closedby: 'any' } as Record<string, string>)}
        onClose={() => {
          if (dialogRef.current) dialogRef.current.returnValue = ''
        }}
      >
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-600 p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="display-prefs-title" className="text-xl font-black text-white">
                Display settings
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Saved on this device for easier reading.
              </p>
            </div>
            <form method="dialog">
              <button
                type="submit"
                value="close"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border border-slate-600 bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Close</span>
              </button>
            </form>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-white">Text size</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['normal', 'large'] as TextSize[]).map((size) => (
                <label
                  key={size}
                  className={`flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-bold cursor-pointer ${
                    textSize === size
                      ? 'border-emerald-400 bg-emerald-500/20 text-white'
                      : 'border-slate-600 bg-slate-950 text-slate-200 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="display-text-size"
                    value={size}
                    checked={textSize === size}
                    onChange={() => savePrefs({ textSize: size, reducedMotion })}
                    className="accent-emerald-400 w-4 h-4"
                  />
                  <span>{size === 'normal' ? 'Normal text' : 'Large text'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 flex items-center justify-between gap-4">
            <div>
              <label htmlFor="pref-reduce-motion" className="text-sm font-bold text-white block">
                Reduce motion
              </label>
              <p className="text-xs text-slate-300 mt-0.5">
                Stops button movement and animations.
                {osReducedMotion ? ' Your device already prefers reduced motion.' : ''}
              </p>
            </div>
            <input
              id="pref-reduce-motion"
              type="checkbox"
              checked={reducedMotion || osReducedMotion}
              onChange={(e) => savePrefs({ textSize, reducedMotion: e.target.checked })}
              className="w-6 h-6 accent-emerald-400 cursor-pointer shrink-0"
            />
          </div>

          <form method="dialog" className="flex justify-end">
            <button
              type="submit"
              value="done"
              autoFocus
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer"
            >
              Done
            </button>
          </form>
        </div>
      </dialog>
    </>
  )
}
