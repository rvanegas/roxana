export type SentenceStatus = 'draft' | 'committed'

export type Sentence = {
  index: number
  id?: string
  content: string
  status: SentenceStatus
  owner?: string
  accepted: string[]
  rejected: string[]
  cleared: string[]
  goal: string[]
  hidden?: boolean
  // the following are only in the store, not layout
  key: string
  autoFocus?: boolean
  inArgument: boolean
  irrational: string[]
}

export type Section = 'propositions' | 'arguments'

export interface ElementRef {
  current: {blur(): void, focus(): void, scrollBy(number, number): void}
}
