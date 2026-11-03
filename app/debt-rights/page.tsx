import Link from 'next/link'
import { getPublishedStates, stateSlug } from '@/lib/state-guides'
import { SITE_URL } from '@/lib/site'

export const metadata = {
  title: 'Debt Collection Rights by State | DisputeNinja',
  description: 'Pick your state to see how long a debt collector has to sue you, your state collection law, and how to dispute a debt.',
  alternates: { canonical: `${SITE_URL}/debt-rights` },
}

export default function DebtRightsIndex() {
  const states = getPublishedStates()
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Debt Collection Rights by State</h1>
      <p className="text-gray-400 mb-6">
        Time limits and rules are different in every state. Pick yours. General information, not legal advice.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {states.map((s) => (
          <li key={s.abbr}>
            <Link href={`/debt-rights/${stateSlug(s.state)}`} className="text-blue-500 hover:underline">
              {s.state}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
