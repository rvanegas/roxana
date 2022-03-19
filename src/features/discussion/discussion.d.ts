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
  inArgument: boolean
  irrational: string[]
}

export type Section = 'propositions' | 'arguments'

export type SentenceMode = 'editing' | 'saving' | ''

export interface ElementRef {
  current: {blur(): void, focus(): void}
}
