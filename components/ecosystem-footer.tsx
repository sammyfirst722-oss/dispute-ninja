import Link from 'next/link'

export function EcosystemFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-400 mt-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Compliance Notice */}
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl mx-auto">
          <strong className="text-slate-300">Important Legal &amp; Compliance Notice:</strong> DisputeNinja is strictly an automated self-advocacy document generation and drafting tool. We do not provide credit repair services, debt settlement, or legal advice. DisputeNinja AI is an educational technology platform to assist users representing themselves (pro-se) in administrative disputes. Use of this tool does not create an attorney-client relationship.
        </p>

        {/* Brand & Ecosystem Mesh Links */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://lowkeyaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-200 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>A Lowkey AI Tech Product</span>
            </a>
            <span className="text-slate-700">•</span>
            <span>&copy; {new Date().getFullYear()} Sammy First LLC</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-slate-400">
            <Link href="/privacy" className="hover:text-emerald-400 hover:underline transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-emerald-400 hover:underline transition-colors">
              Terms
            </Link>
            <span className="text-slate-700">•</span>
            <a
              href="tel:5203571814"
              className="hover:text-emerald-400 hover:underline transition-colors"
            >
              Hotline: (520) 357-1814
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://lowkeyaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 hover:underline transition-colors"
            >
              All Products
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
