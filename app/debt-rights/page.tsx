import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPublishedStates, stateSlug } from '@/lib/state-guides'
import { StateSearch } from '@/components/state-search'
import { SITE_URL } from '@/lib/site'

export const metadata = {
  title: 'Debt Collection Rights by State | DisputeNinja',
  description:
    'Pick your state to see how long a debt collector has to sue you, your state collection law, and how to dispute a debt.',
  alternates: { canonical: `${SITE_URL}/debt-rights` },
}

export default function DebtRightsIndex() {
  const states = getPublishedStates().map((s) => ({
    abbr: s.abbr,
    state: s.state,
    slug: stateSlug(s.state),
  }))

  return (
    <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-8 space-y-6 outline-none">
      <Link
        href="/"
        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Back to Dispute Tool</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Debt Collection Rights by State</h1>
        <p className="text-sm sm:text-base text-slate-200">
          Time limits to be sued are different in every state. Search or pick your state below. General information, not legal advice.
        </p>
      </div>

      <StateSearch states={states} />
    </main>
  )
}
