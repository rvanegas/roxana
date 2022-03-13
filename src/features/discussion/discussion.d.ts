export type SentenceStatus = 'draft' | 'editable' | 'readOnly' | 'referenced'

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
  arguments: number[]
}

export type Section = 'propositions' | 'arguments'

export type SentenceMode = 'editing' | 'saving' | ''

export interface ElementRef {
  current: {blur(): void, focus(): void}
}
