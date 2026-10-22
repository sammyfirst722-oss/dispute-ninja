import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DisputeNinja AI — Stop Unfair Bills & Debt in 30 Seconds',
  description: 'AI-powered self-advocacy dispute letters for medical overcharges, debt collector harassment, and security deposits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500/30 selection:text-rose-200">
        {/* 24/7 Consumer Legal Rights Hotline Banner */}
        <div className="bg-slate-900 border-b border-slate-800 text-slate-200 py-2 px-4 text-center text-xs sm:text-sm flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            24/7 Free Consumer Rights Hotline:
          </span>
          <a
            href="tel:5203571814"
            className="font-bold text-white hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            (520) 357-1814
          </a>
          <span className="text-slate-400 hidden md:inline">
            • Free automated statutory guidance & instant dispute text
          </span>
        </div>

        {/* Cross-Promotion Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-emerald-50 py-1.5 px-4 text-center text-xs font-medium">
          <span className="opacity-80 uppercase tracking-wider text-[10px] font-bold mr-2">New</span>
          Skip media rage-bait. Get the zero-noise, high-signal smart cut on SimplyBigNews &rarr; <a href="https://plainnews.vercel.app" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2 hover:text-white transition-colors ml-1">Read SimplyBigNews &rarr;</a>
        </div>

        {children}
      </body>
    </html>
  )
}
