import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Scale, AlertTriangle, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react'
import { getPublishedStates, getStateBySlug, stateSlug, solRows, yearsLabel } from '@/lib/state-guides'
import { SolCalculator } from '@/components/sol-calculator'

const BASE = 'https://dispute-ninja.vercel.app'

export async function generateStaticParams() {
  return getPublishedStates().map((s) => ({ state: stateSlug(s.state) }))
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const s = getStateBySlug(state)
  if (!s) return {}
  return {
    title: `${s.state} Debt Collection Rights & Time Limits | DisputeNinja`,
    description: `How long can a debt collector sue you in ${s.state}? See ${s.state} time limits by debt type, your federal rights, and how to dispute a debt in writing.`,
    alternates: { canonical: `${BASE}/debt-rights/${state}` },
  }
}

export default async function StateDebtRightsPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const s = getStateBySlug(state)
  if (!s) notFound()

  const rows = solRows(s)
  const all = getPublishedStates()
  const others = all.filter((o) => o.abbr !== s.abbr)
  const idx = all.findIndex((o) => o.abbr === s.abbr)
  const neighbors = [all[idx - 1], all[idx + 1]].filter(Boolean)
  const main = s.solOpenAccountYears ?? s.solWrittenContractYears

  const faqs = [
    main !== null && {
      question: `How long can a debt collector sue me in ${s.state}?`,
      answer: `For most consumer debts in ${s.state} the time limit to file a lawsuit is ${yearsLabel(main)}${
        s.solCitation ? ` (${s.solCitation})` : ''
      }. The exact period depends on the type of debt, so check the table above.`,
    },
    {
      question: 'Does an old debt disappear from my credit report when the time limit ends?',
      answer:
        'No. The time limit to sue and the credit report time limit are different. Under federal law most negative items fall off a credit report about 7 years after the first missed payment.',
    },
    {
      question: 'Can a collector still contact me about a debt that is past the time limit?',
      answer:
        'Often yes, but federal rules do not allow a collector to sue or threaten to sue on a debt they know is past the time limit. You can send a written request to stop contact.',
    },
    s.stateCollectionLaw && {
      question: `Does ${s.state} have its own debt collection law?`,
      answer: `Yes: the ${s.stateCollectionLaw}. It works alongside the federal Fair Debt Collection Practices Act.`,
    },
  ].filter(Boolean) as { question: string; answer: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/debt-rights" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        All states
      </Link>

      <h1 className="text-3xl font-bold mb-2">{s.state} Debt Collection Rights and Time Limits</h1>
      <p className="text-gray-400 mb-6 text-sm">Last reviewed {s.reviewedOn}. General information, not legal advice.</p>

      {rows.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Time limit to be sued in {s.state}
          </h2>
          <table className="w-full text-sm bg-gray-50 text-gray-900 rounded-lg overflow-hidden">
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-gray-200 last:border-0">
                  <td className="p-3 font-medium">{r.label}</td>
                  <td className="p-3">{yearsLabel(r.years)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {s.solCitation && <p className="text-xs text-gray-400 mt-2">Statutes: {s.solCitation}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Figures were cross-checked against Alper Law&apos;s 2026 state chart. Rows we could not confirm are left out. Laws change, so check your state&apos;s current statute.
          </p>
        </section>
      )}

      {rows.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Estimate when the time limit ends</h2>
          <SolCalculator stateName={s.state} rows={rows} />
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          What to do if a collector contacts you in {s.state}
        </h2>
        <ol className="space-y-4">
          {[
            ['Do not pay or sign anything yet', 'On an old debt a payment or a signed paper can restart the clock in some states. Get the facts first.'],
            ['Ask for validation in writing', 'Federal law lets you ask the collector to prove the debt. Send it within 30 days of their first notice by certified mail.'],
            ['Keep every letter and note every call', 'Dates, names and amounts matter if you need to file a complaint later.'],
            ['Report broken rules', `You can complain to your state attorney general's consumer protection office. The federal CFPB also takes complaints.`],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
          <a
            href="https://www.usa.gov/state-consumer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-500 hover:underline"
          >
            Find your state consumer office <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://www.consumerfinance.gov/complaint/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-500 hover:underline"
          >
            File a CFPB complaint <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Frequently asked questions
        </h2>
        <dl className="space-y-4">
          {faqs.map((f) => (
            <div key={f.question}>
              <dt className="font-medium">{f.question}</dt>
              <dd className="text-gray-400">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center mb-8">
        <h3 className="text-xl font-black text-white mb-2">Need a letter right now?</h3>
        <p className="text-slate-400 text-sm mb-4">
          Our tool helps you write a debt validation letter in minutes. It creates self-help documents, not legal advice.
        </p>
        <Link
          href="/dispute/debt-collector-validation-letter"
          className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-500 transition-colors"
        >
          Debt validation letter guide
        </Link>
      </div>

      <nav aria-label="Nearby states" className="text-sm text-gray-400">
        <p className="mb-2">Other states:</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {[...neighbors, ...others.filter((o) => !neighbors.includes(o)).slice(0, 8)].map((o) => (
            <li key={o.abbr}>
              <Link href={`/debt-rights/${stateSlug(o.state)}`} className="text-blue-500 hover:underline">
                {o.state}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </main>
  )
}
