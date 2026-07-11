export interface TruthEvaluation {
  symbol: string
  truth_value: number
  reasoning?: string
}

export interface ValidityEvaluation {
  symbol: string
  validity_value: number
  reasoning?: string
}

export interface IncoherentSet {
  symbols: string[]
  incoherence_value: number
  reasoning?: string
}

export interface FormalizationItem {
  symbol: string
  ascii: string
  json_structure: string
}

export interface PropositionEvaluation {
  symbol: string
  validity: number
  reasoning: string
}

export interface PhrasingEvaluation {
  symbol: string
  issues: string[]
  recommendation: string
}

export interface AuditFinding {
  condition: 'connectivity' | 'conclusion' | 'integrity'
  step_symbols: string[]
  issue: string
  pointer: string
}

export interface AuditResult {
  satisfied: boolean
  findings: AuditFinding[]
}

export interface DianoiaResultData {
  // content_evaluator
  truthEvaluations: TruthEvaluation[]
  validityEvaluations: ValidityEvaluation[]
  incoherentSets: IncoherentSet[]
  contentLogicalIssues: string[]
  contentRecommendations: string[]
  // formalizer
  formalizations: FormalizationItem[]
  // phrasing_evaluator (absent in results saved before it existed)
  phrasingEvaluations?: PhrasingEvaluation[]
  // form_evaluator
  propositionEvaluations: PropositionEvaluation[]
  argumentValidity: number | null
  formalLogicalIssues: string[]
  formalRecommendations: string[]
}
