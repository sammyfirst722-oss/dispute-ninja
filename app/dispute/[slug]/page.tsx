import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDisputeGuide, getAllDisputeSlugs } from '@/lib/dispute-guides'
import { CopyButton } from '@/components/copy-button'
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, FileText, CheckCircle2, ChevronRight, DollarSign, Download } from 'lucide-react'
import { StickyCheckoutCTA } from '@/components/sticky-cta'

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
      canonical: `https://dispute-ninja.vercel.app/dispute/${slug}`,
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
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to guides
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {guide.badge}
        </span>
        <span className="text-sm text-gray-600">{guide.statutoryDeadline}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
      <p className="text-gray-600 mb-4">{guide.statute}</p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p>{guide.summary}</p>
      </div>

      <div className="flex items-center gap-2 bg-green-50 p-4 rounded-lg mb-6">
        <DollarSign className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-900">Estimated Savings</p>
          <p className="text-green-800">{guide.estimatedSavings}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Step-by-Step Checklist
        </h2>
        <ol className="space-y-4">
          {guide.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Legal Grounds
        </h2>
        <ul className="space-y-2">
          {guide.legalGrounds.map((ground, index) => (
            <li key={index} className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
              <span>{ground}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Sample Letter Excerpt
        </h2>
        <div className="relative">
          <CopyButton text={guide.sampleSnippet} />
          <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-x-auto text-sm">
            {guide.sampleSnippet}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Frequently Asked Questions
        </h2>
        <dl className="space-y-4">
          {guide.faqs.map((faq, index) => (
            <div key={index}>
              <dt className="font-medium">{faq.question}</dt>
              <dd className="text-gray-600">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid md:grid-cols-1 gap-4 mb-24">
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <h3 className="text-xl font-black text-white mb-2">Want to generate your letter right now?</h3>
          <p className="text-slate-400 text-sm mb-4">Use our free AI tool to scan your bill and generate the exact certified letter you need.</p>
          <Link 
            href="/" 
            className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-500 transition-colors"
          >
            Start Free Audit & Letter Generator
          </Link>
        </div>
      </div>

      <StickyCheckoutCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  )
}