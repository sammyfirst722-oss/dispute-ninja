import type { Metadata } from 'next'
import { DisputeClient } from '@/components/dispute-client'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen outline-none">
      <DisputeClient />
    </main>
  )
}
