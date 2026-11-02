import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | DisputeNinja',
  description: 'Terms and conditions for using DisputeNinja.',
}

const UPDATED = 'November 2, 2026'
const CONTACT = 'sammyfirst722@gmail.com'

export default function TermsPage() {
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
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last updated: {UPDATED}</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using DisputeNinja, you agree to be bound by these Terms of Service. If you
              disagree with any part of the terms, you may not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Not Legal Advice</h2>
            <p>
              DisputeNinja is an automated self-advocacy document drafting tool. We do not provide legal advice,
              credit repair services or debt settlement, and we are not a law firm. Using this tool does not create
              an attorney-client relationship. The checklists and letters are general templates. Laws differ by
              state and change over time, and we cannot promise any result, such as a lower bill, a removed account
              or a stopped collection. For advice about your situation, talk to a licensed attorney or a legal aid
              organization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Your Responsibility</h2>
            <p>
              You are responsible for checking that the information in any letter is accurate, for deciding whether
              and how to send it, and for meeting any deadlines that apply to you. Do not send a dispute you know
              to be false.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Purchases</h2>
            <p>
              Paid items (a single dispute letter and the Action Kit) are one-time digital purchases processed by
              Stripe on the website or by Google Play in the Android app. They are delivered to you on screen or as a
              download after payment is confirmed. There are no subscriptions. We do not print or mail letters for
              you. If you have a problem with a purchase, contact us and we will work with you to fix it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> 5. Contact
            </h2>
            <p>
              For legal or support questions, contact us at{' '}
              <a href={`mailto:${CONTACT}`} className="font-bold text-blue-600 underline underline-offset-2">
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
