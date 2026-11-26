'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

export interface StateItem {
  abbr: string
  state: string
  slug: string
}

export function StateSearch({ states }: { states: StateItem[] }) {
  const [query, setQuery] = useState('')

  const trimmed = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!trimmed) return states
    return states.filter(
      (s) => s.state.toLowerCase().includes(trimmed) || s.abbr.toLowerCase() === trimmed
    )
  }, [states, trimmed])

  // Group states cleanly into 4 scannable alphabetical ranges (A3)
  const groups = useMemo(() => {
    const defs = [
      { label: 'A – F', re: /^[A-F]/i },
      { label: 'G – M', re: /^[G-M]/i },
      { label: 'N – S', re: /^[N-S]/i },
      { label: 'T – Z', re: /^[T-Z]/i },
    ]
    return defs
      .map((g) => ({
        label: g.label,
        items: filtered.filter((s) => g.re.test(s.state)),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  return (
    <div className="space-y-6">
      <search>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl bg-slate-900 border border-slate-700 p-4 space-y-2"
        >
          <label htmlFor="state-search-input" className="block text-sm font-bold text-white">
            Find your state
          </label>
          <p id="state-search-hint" className="text-xs text-slate-300">
            Type a state name or 2-letter code (for example: Arizona or AZ).
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="state-search-input"
                type="search"
                name="state"
                value={query}
                aria-describedby="state-search-hint"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search states..."
                autoCorrect="off"
                spellCheck={false}
                className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-500 text-white placeholder:text-slate-400"
              />
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="inline-flex items-center gap-1.5 min-h-[48px] px-4 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Clear search</span>
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="text-xs text-slate-300 pt-1">
            Showing {filtered.length} of {states.length} states
            {trimmed ? ` for "${query.trim()}"` : ''}.
          </p>
        </form>
      </search>

      {/* Designed empty state for no search results (A22) */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center space-y-3">
          <p className="text-base font-bold text-white">
            No states matched &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="text-sm text-slate-300">
            Check the spelling or clear your search to see all {states.length} available states.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer"
          >
            <span>Clear search</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label} className="space-y-2.5">
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                {group.label}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {group.items.map((s) => (
                  <li key={s.abbr}>
                    <Link
                      href={`/debt-rights/${s.slug}`}
                      className="flex items-center justify-between min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-sm font-bold text-sky-200 hover:text-white dn-pressable"
                    >
                      <span>{s.state}</span>
                      <span className="text-xs font-mono text-slate-300">{s.abbr}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
