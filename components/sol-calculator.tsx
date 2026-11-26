'use client'

import { useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'

interface Row {
  label: string
  years: number
}

export function SolCalculator({ stateName, rows }: { stateName: string; rows: Row[] }) {
  const [date, setDate] = useState('')

  const results = date
    ? rows.map((r) => {
        const end = new Date(date + 'T00:00:00')
        end.setFullYear(end.getFullYear() + r.years)
        return { ...r, end, expired: end.getTime() < Date.now() }
      })
    : []

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="default-date" className="block text-sm font-bold text-white">
          Date of your first missed payment on the debt
        </label>
        <p id="default-date-hint" className="text-xs text-slate-300">
          Pick a date to estimate when {stateName}&apos;s lawsuit time limit ends.
        </p>
        <input
          id="default-date"
          type="date"
          value={date}
          aria-describedby="default-date-hint"
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[48px] w-full max-w-xs rounded-xl border border-slate-500 bg-slate-950 px-3.5 py-2 text-white"
        />
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-300 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-3.5">
          Choose a date above to see estimated time-limit end dates for each debt type in {stateName}.
        </p>
      ) : (
        <ul className="space-y-2.5" aria-live="polite">
          {results.map((r) => (
            <li
              key={r.label}
              className="rounded-xl bg-slate-950 border border-slate-700 p-3.5 text-sm flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-white">{r.label}:</span>{' '}
                <span className="text-slate-200">
                  estimated end{' '}
                  {r.end.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  r.expired
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-400/50'
                }`}
              >
                {r.expired ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>{r.expired ? 'May be past limit' : 'Within time limit'}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-300 leading-relaxed">
        Estimate only, not legal advice. In {stateName}, the clock can start on a different date or restart if you make a payment or sign a promise to pay. Check your state rules before paying or signing anything on an old debt.
      </p>
    </div>
  )
}
