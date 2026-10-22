import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Mail, EyeOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | DisputeNinja',
  description: 'How DisputeNinja protects your sensitive financial and medical data.',
}

const UPDATED = 'October 3, 2026'
const CONTACT = 'sammyfirst722@gmail.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to DisputeNinja
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last updated: {UPDATED}</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              DisputeNinja (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides AI-generated self-advocacy letters. 
              Because you may input sensitive financial or medical information into our prompts, 
              your privacy and security are our highest priority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-blue-600" /> 2. No Data Retention
            </h2>
            <p>
              The details you enter to generate a dispute letter (such as account numbers, medical codes, or balances) 
              are processed ephemerally in memory to generate your document. We do NOT store your dispute data in any database, 
              and we do not sell your data to debt collectors or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Stripe Payments</h2>
            <p>
              Payments are processed securely via Stripe. We do not have access to your full credit card number or bank details. 
              Stripe&apos;s privacy policy governs the processing of your payment information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> 4. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please email us directly at:{' '}
              <a
                href={`mailto:${CONTACT}`}
                className="font-bold text-blue-600 underline underline-offset-2"
              >
                {CONTACT}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
