import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Mail, EyeOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | DisputeNinja',
  description: 'How DisputeNinja protects your sensitive financial and medical data.',
}

const UPDATED = 'November 25, 2026'
const CONTACT = 'sammyfirst722@gmail.com'

export default function PrivacyPage() {
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
            <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" aria-hidden="true" />
            <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-sm text-slate-300">Last updated: {UPDATED}</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-200">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Overview</h2>
            <p>
              DisputeNinja (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides self-help dispute letter templates.
              Because you may type financial or medical bill details into the form, protecting your privacy is a priority.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>2. Local Drafts &amp; No Server Database Storage</span>
            </h2>
            <p>
              To prevent losing your work on refresh, your draft inputs are saved only in your own browser&apos;s local storage
              on your device (and you can clear them anytime with one tap). We do not store your bill text in our own database
              and we never sell your data to debt collectors or third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Stripe &amp; Google Play Payments</h2>
            <p>
              Payments are processed securely by Stripe (on the web) or Google Play (in the Android app). We never see or store
              your full credit card number. For a Single Dispute Letter purchase, basic order details (company name, dispute type,
              and amount) are attached to your Stripe checkout session so your letter can be delivered after payment confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>4. Contact Us</span>
            </h2>
            <p>
              Questions about this Privacy Policy? Email{' '}
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
