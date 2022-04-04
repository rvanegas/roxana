export type SentenceStatus = 'draft' | 'committed'

export type Sentence = {
  key: string
  index: number
  id?: string
  content: string
  autoFocus?: boolean
  status: SentenceStatus
  owner?: string
  accepted: string[]
  rejected: string[]
  goal: string[]
  inArgument: boolean
  irrational: string[]
}

export type Section = 'propositions' | 'arguments'

export interface ElementRef {
  current: {blur(): void, focus(): void}
}
