import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDisputeGuide, getAllDisputeSlugs } from '@/lib/dispute-guides'
import { CopyButton } from '@/components/copy-button'
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import { StickyCheckoutCTA } from '@/components/sticky-cta'
import { SITE_URL } from '@/lib/site'

export async function generateStaticParams() {
  return getAllDisputeSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getDisputeGuide(slug)
  if (!guide) return {}
  return {
    title: `${guide.title} | DisputeNinja`,
    description: guide.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/dispute/${slug}`,
    },
  }
}

export default async function DisputeGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getDisputeGuide(slug)
  if (!guide) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-8 space-y-8 outline-none">
      <Link
        href="/"
        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Back to Dispute Tool</span>
      </Link>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
            {guide.badge}
          </span>
          <span className="text-sm text-slate-300 font-medium">{guide.statutoryDeadline}</span>
        </div>

        <h1 className="text-3xl font-black text-white">{guide.title}</h1>
        <p className="text-sm font-semibold text-sky-300">{guide.statute}</p>

        <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 text-sm sm:text-base text-slate-100 leading-relaxed">
          <p>{guide.summary}</p>
          <p className="text-xs text-slate-300 mt-3">
            General consumer information only — not legal advice. Verify current law and deadlines for your state.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Step-by-step checklist</span>
        </h2>
        <ol className="space-y-3">
          {guide.steps.map((step, index) => (
            <li key={index} className="flex gap-3 rounded-xl bg-slate-900 border border-slate-800 p-4">
              <ChevronRight className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-white">{step.title}</p>
                <p className="text-slate-200 text-sm mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-sky-300 shrink-0" aria-hidden="true" />
          <span>Key law points to check</span>
        </h2>
        <ul className="space-y-2.5 rounded-2xl bg-slate-900 border border-slate-800 p-5">
          {guide.legalGrounds.map((ground, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-300 mt-1 shrink-0" aria-hidden="true" />
              <span>{ground}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Sample letter excerpt</span>
          </h2>
          <CopyButton text={guide.sampleSnippet} label="Copy sample" />
        </div>
        <pre className="rounded-2xl bg-slate-900 border border-slate-700 p-5 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-slate-100 leading-relaxed">
          {guide.sampleSnippet}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
          <span>Frequently asked questions</span>
        </h2>
        <dl className="space-y-3">
          {guide.faqs.map((faq, index) => (
            <div key={index} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1">
              <dt className="font-bold text-white">{faq.question}</dt>
              <dd className="text-slate-200 text-sm leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="p-6 bg-slate-900 rounded-2xl border border-slate-700 text-center space-y-3">
        <h2 className="text-xl font-black text-white">Build your dispute letter now</h2>
        <p className="text-slate-200 text-sm max-w-xl mx-auto">
          Use our free 3-step checklist and self-help letter preview to draft a letter with your facts.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[48px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-7 py-3 rounded-xl font-black text-sm dn-pressable"
        >
          Open Free Checklist &amp; Letter Builder
        </Link>
      </section>

      {/* Inline checkout card instead of fixed bottom bar (prevents WCAG 2.4.11 focus occlusion) */}
      <StickyCheckoutCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </main>
  )
}
