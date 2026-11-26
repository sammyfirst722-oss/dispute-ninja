import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as analyzePost } from '@/app/api/analyze/route'

describe('/api/analyze route', () => {
  it('returns checklist, official statute sources, and per-field checks without claiming violations were detected', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disputeType: 'debt',
        creditorName: 'Midland Credit Management',
        disputedAmount: '1450',
        billText: 'Calling daily demanding $1,450 without written verification.',
        lang: 'en',
      }),
    })
    const res = await analyzePost(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.violations)).toBe(true)
    expect(data.violations.length).toBeGreaterThanOrEqual(3)
    expect(Array.isArray(data.statutes)).toBe(true)
    expect(data.statutes[0].url).toMatch(/^https:\/\//)
    // Flags missing userName and accountNum honestly instead of inventing a confidence %
    expect(data.fieldChecks.some((c: any) => c.field === 'userName')).toBe(true)
    expect(data.fieldChecks.some((c: any) => c.field === 'accountNum')).toBe(true)
    expect(data.summary.toLowerCase()).toContain('does not read your bill or give legal advice')
  })

  it('rejects descriptions shorter than 10 characters with an actionable 400 error', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disputeType: 'medical',
        creditorName: 'Hospital',
        disputedAmount: '500',
        billText: 'short',
      }),
    })
    const res = await analyzePost(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/10 characters/i)
  })
})
