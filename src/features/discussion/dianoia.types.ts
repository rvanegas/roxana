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

export interface DianoiaResultData {
  // content_evaluator
  truthEvaluations: TruthEvaluation[]
  validityEvaluations: ValidityEvaluation[]
  incoherentSets: IncoherentSet[]
  contentLogicalIssues: string[]
  contentRecommendations: string[]
  // formalizer
  formalizations: FormalizationItem[]
  // form_evaluator
  propositionEvaluations: PropositionEvaluation[]
  argumentValidity: number | null
  formalLogicalIssues: string[]
  formalRecommendations: string[]
}
