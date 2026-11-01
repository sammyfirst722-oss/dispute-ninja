import facts from '@/content/state-facts.json'

export interface StateFacts {
  state: string
  abbr: string
  verified: boolean
  reviewedOn: string
  solWrittenContractYears: number | null
  solOralContractYears: number | null
  solPromissoryNoteYears: number | null
  solOpenAccountYears: number | null
  solCitation: string | null
  stateCollectionLaw: string | null
}

const ALL = Object.values(facts as Record<string, StateFacts>)

export const stateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

// Only states a human/Lead Architect has verified are published.
export function getPublishedStates(): StateFacts[] {
  return ALL.filter((s) => s.verified).sort((a, b) => a.state.localeCompare(b.state))
}

export function getStateBySlug(slug: string): StateFacts | undefined {
  return getPublishedStates().find((s) => stateSlug(s.state) === slug)
}

export const yearsLabel = (n: number) => `${n} year${n === 1 ? '' : 's'}`

export function solRows(s: StateFacts): { label: string; years: number }[] {
  const rows: { label: string; years: number | null }[] = [
    { label: 'Written contracts', years: s.solWrittenContractYears },
    { label: 'Oral contracts', years: s.solOralContractYears },
    { label: 'Promissory notes', years: s.solPromissoryNoteYears },
    { label: 'Credit cards and other open accounts', years: s.solOpenAccountYears },
  ]
  return rows.filter((r): r is { label: string; years: number } => r.years !== null)
}
