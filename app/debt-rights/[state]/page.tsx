import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Scale, AlertTriangle, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react'
import { getPublishedStates, getStateBySlug, stateSlug, solRows, yearsLabel } from '@/lib/state-guides'
import { SolCalculator } from '@/components/sol-calculator'
import { SITE_URL } from '@/lib/site'

const BASE = SITE_URL

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
      answer: `For most consumer debts in ${s.state} the time limit to file a lawsuit is ${yearsLabel(main)}. The exact period depends on the type of debt, so check the table above.`,
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
    <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-8 space-y-8 outline-none">
      <Link
        href="/debt-rights"
        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>All states</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">{s.state} Debt Collection Rights and Time Limits</h1>
        <p className="text-slate-300 text-sm">Last reviewed {s.reviewedOn}. General information, not legal advice.</p>
      </div>

      {rows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Time limit to be sued in {s.state}</span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900">
            <table className="w-full text-sm text-left">
              <caption className="visually-hidden">
                {s.state} debt lawsuit time limits by debt type
              </caption>
              <thead className="bg-slate-950 text-slate-200 border-b border-slate-700">
                <tr>
                  <th scope="col" className="p-3.5 font-bold">Debt type</th>
                  <th scope="col" className="p-3.5 font-bold">Time limit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-slate-800 last:border-0">
                    <th scope="row" className="p-3.5 font-semibold text-white">{r.label}</th>
                    <td className="p-3.5 text-emerald-300 font-bold">{yearsLabel(r.years)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-300">Periods shown are for ordinary consumer debt. Some debt types have different rules.</p>
          {s.solCitation && <p className="text-xs text-slate-300">Related statutes: {s.solCitation}</p>}
          <p className="text-xs text-slate-300">
            Figures were cross-checked against Alper Law&apos;s 2026 state chart. Rows we could not confirm are left out. Laws change, so check your state&apos;s current statute.
          </p>
        </section>
      )}

      {rows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Estimate when the time limit ends</h2>
          <SolCalculator stateName={s.state} rows={rows} />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>What to do if a collector contacts you in {s.state}</span>
        </h2>
        <ol className="space-y-3.5">
          {[
            ['Do not pay or sign anything yet', 'On an old debt a payment or a signed paper can restart the clock in some states. Get the facts first.'],
            ['Ask for validation in writing', 'Federal law lets you ask the collector to prove the debt. Send it within 30 days of their first notice by certified mail.'],
            ['Keep every letter and note every call', 'Dates, names and amounts matter if you need to file a complaint later.'],
            ['Report broken rules', `You can complain to your state attorney general's consumer protection office. The federal CFPB also takes complaints.`],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3 rounded-xl bg-slate-900 border border-slate-800 p-4">
              <ChevronRight className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-white">{title}</p>
                <p className="text-slate-200 text-sm mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="https://www.usa.gov/state-consumer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            <span>Find your state consumer office</span>
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
          <a
            href="https://www.consumerfinance.gov/complaint/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            <span>File a CFPB complaint</span>
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
          <span>Frequently asked questions</span>
        </h2>
        <dl className="space-y-3.5">
          {faqs.map((f) => (
            <div key={f.question} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1">
              <dt className="font-bold text-white">{f.question}</dt>
              <dd className="text-slate-200 text-sm leading-relaxed">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="p-6 bg-slate-900 rounded-2xl border border-slate-700 text-center space-y-3">
        <h2 className="text-xl font-black text-white">Need a dispute letter template?</h2>
        <p className="text-slate-200 text-sm max-w-xl mx-auto">
          Build a free checklist and debt validation letter preview in 3 steps. Self-help templates, not legal advice.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[48px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-black text-sm dn-pressable"
          >
            Open Dispute Tool
          </Link>
          <Link
            href="/dispute/debt-collector-validation-letter"
            className="inline-flex items-center justify-center min-h-[48px] border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-sm dn-pressable"
          >
            Debt validation guide
          </Link>
        </div>
      </section>

      <nav aria-label="Nearby states" className="text-sm text-slate-300 space-y-2">
        <p className="font-bold text-white">Other states:</p>
        <ul className="flex flex-wrap gap-2">
          {[...neighbors, ...others.filter((o) => !neighbors.includes(o)).slice(0, 8)].map((o) => (
            <li key={o.abbr}>
              <Link
                href={`/debt-rights/${stateSlug(o.state)}`}
                className="inline-flex items-center min-h-[44px] px-3 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-400 text-sky-300 hover:text-white font-semibold"
              >
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
