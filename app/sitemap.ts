import { MetadataRoute } from 'next'
import { getAllDisputeSlugs } from '@/lib/dispute-guides'
import { getPublishedStates, stateSlug } from '@/lib/state-guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dispute-ninja.vercel.app'
  const slugs = getAllDisputeSlugs()

  const disputeUrls = slugs.map((slug) => ({
    url: `${baseUrl}/dispute/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const states = getPublishedStates()
  const stateUrls = states.map((s) => ({
    url: `${baseUrl}/debt-rights/${stateSlug(s.state)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...(states.length > 0
      ? [{ url: `${baseUrl}/debt-rights`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 }]
      : []),
    ...disputeUrls,
    ...stateUrls,
  ]
}
