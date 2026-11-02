import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The paid Action Kit file lives in /private (not /public). Make sure it is shipped with the kit route.
  outputFileTracingIncludes: {
    '/api/kit': ['./private/**/*'],
  },
}

export default nextConfig
