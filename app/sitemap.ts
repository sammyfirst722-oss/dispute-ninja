import { MetadataRoute } from 'next'
import { getAllDisputeSlugs } from '@/lib/dispute-guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dispute-ninja.vercel.app'
  const slugs = getAllDisputeSlugs()

  const disputeUrls = slugs.map((slug) => ({
    url: `${baseUrl}/dispute/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...disputeUrls,
  ]
}
