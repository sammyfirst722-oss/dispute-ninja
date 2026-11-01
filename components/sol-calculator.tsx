'use client'

import { useState } from 'react'

interface Row { label: string; years: number }

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
    <div className="bg-gray-50 p-4 rounded-lg text-gray-900">
      <label htmlFor="default-date" className="block font-medium mb-2">
        Date of your first missed payment on the debt
      </label>
      <input
        id="default-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
      />
      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={r.label} className="text-sm">
              <span className="font-medium">{r.label}:</span> time limit would end{' '}
              {r.end.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}{' '}
              <span className={r.expired ? 'text-green-700 font-semibold' : 'text-amber-700 font-semibold'}>
                {r.expired ? '(may already be past)' : '(not yet reached)'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-gray-600">
        This is an estimate only. In {stateName} the clock can start on a different date, and in some situations it can
        restart, for example if you make a payment or sign something. Do not pay or sign anything on an old debt until you
        have checked your rights.
      </p>
    </div>
  )
}
