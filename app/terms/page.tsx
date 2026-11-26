import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | DisputeNinja',
  description: 'Terms and conditions for using DisputeNinja.',
}

const UPDATED = 'November 25, 2026'
const CONTACT = 'sammyfirst722@gmail.com'

export default function TermsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-8 sm:py-12 outline-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Back to DisputeNinja</span>
        </Link>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-400 shrink-0" aria-hidden="true" />
            <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-sm text-slate-300">Last updated: {UPDATED}</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-200">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using DisputeNinja, you agree to these Terms of Service. If you disagree with any part,
              please do not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Not Legal Advice</h2>
            <p>
              DisputeNinja is a self-help document template tool. We do not provide legal advice, credit repair services,
              or debt settlement, and we are not a law firm. Using this tool does not create an attorney-client relationship.
              The checklists and letters are general templates. Laws differ by state and change over time, and we cannot
              promise any result, such as a lower bill, a removed account, or a stopped collection. For advice about your
              situation, talk to a licensed attorney or a legal aid organization.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Your Responsibility</h2>
            <p>
              You are responsible for checking that every name, date, account number, and amount in any letter is accurate,
              for deciding whether and how to send it, and for meeting any deadlines that apply to you. Do not send a dispute
              you know to be false.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Purchases</h2>
            <p>
              Paid items (Single Dispute Letter and 5-Letter Dispute Kit) are one-time digital purchases processed by Stripe
              on the website or by Google Play in the Android app. They are delivered on screen or as a download after payment
              is confirmed. There are no subscriptions. We do not print or mail letters for you. If you have a problem with a
              purchase, contact us and we will work with you to fix it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>5. Contact</span>
            </h2>
            <p>
              For legal or support questions, email{' '}
              <a href={`mailto:${CONTACT}`} className="font-bold text-sky-300 hover:text-sky-200 underline underline-offset-4">
                {CONTACT}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
