import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { EcosystemFooter } from '@/components/ecosystem-footer'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DisputeNinja — Self-Help Dispute Letters for Bills & Debt',
  description:
    'Build a clear self-help dispute checklist and letter template for debt collectors, medical bills, credit report errors, and security deposits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-100 flex flex-col">
        <SiteHeader />

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        <EcosystemFooter />
        <Analytics />
      </body>
    </html>
  )
}
