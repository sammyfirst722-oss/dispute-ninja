import Link from 'next/link'

export function EcosystemFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 text-sm text-slate-300 mt-auto no-print">
      <div className="max-w-4xl mx-auto space-y-5">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          <strong className="text-white">Important notice:</strong> DisputeNinja is a self-help document template tool. We are not a law firm and do not give legal advice, credit repair, or debt settlement services. Using this site does not create an attorney-client relationship. Always review your facts before sending any letter.
        </p>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <a
              href="https://lowkeyaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] font-bold text-white hover:text-emerald-300 underline underline-offset-4"
            >
              A Lowkey AI Tech Product
            </a>
            <span aria-hidden="true" className="text-slate-500">•</span>
            <span className="text-slate-300">&copy; {new Date().getFullYear()} Sammy First LLC</span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
            <Link href="/privacy" className="inline-flex items-center min-h-[44px] px-2 text-slate-200 hover:text-emerald-300 underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex items-center min-h-[44px] px-2 text-slate-200 hover:text-emerald-300 underline underline-offset-4">
              Terms
            </Link>
            <Link href="/debt-rights" className="inline-flex items-center min-h-[44px] px-2 text-slate-200 hover:text-emerald-300 underline underline-offset-4">
              State Rights
            </Link>
            <a
              href="tel:5203571814"
              className="inline-flex items-center min-h-[44px] px-2 text-slate-200 hover:text-emerald-300 underline underline-offset-4"
            >
              Hotline: (520) 357-1814
            </a>
            <a
              href="https://lowkeyaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] px-2 text-slate-200 hover:text-emerald-300 underline underline-offset-4"
            >
              All Products
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
