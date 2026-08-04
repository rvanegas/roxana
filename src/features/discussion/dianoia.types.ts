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

export interface PropositionChange {
  symbol: string | null
  proposition: string
  type: 'new' | 'rewrite'
  original_symbol: string | null
  original_proposition: string | null
  justifies_symbol: string | null
  justification_suggestions: string[]
}

export interface ExpectedConclusionImprovement {
  truth_score_improvement: string
  content_validity_improvement: string
  formal_validity_improvement: string
}

export interface ImproverRecommendation {
  id: string
  reasoning: string
  impact: 'high' | 'medium' | 'low'
  target_proposition: string
  expected_conclusion_improvement: ExpectedConclusionImprovement
  propositions: PropositionChange[]
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
  // formalizer
  formalizations: FormalizationItem[]
  // phrasing_evaluator (absent in results saved before it existed)
  phrasingEvaluations?: PhrasingEvaluation[]
  // form_evaluator
  propositionEvaluations: PropositionEvaluation[]
  argumentValidity: number | null
  formalLogicalIssues: string[]
  // improver — the sole source of applyable recommendations
  // (absent in results saved before evaluators stopped emitting free-text recommendations)
  improverRecommendations?: ImproverRecommendation[]
  // keys (`${rec.id ?? recIndex}#${changeIndex}`) of recommendation changes that
  // have already been applied from this argument's analysis. Persisted so the
  // "applied" marker survives view re-entry and reload.
  appliedChanges?: string[]
  // position of the single new argument derived from applying recommendations of
  // this analysis. The first apply that spawns a new argument records it here;
  // subsequent applies fold their change into that same argument instead of
  // creating another. Persisted so the merge target survives reload.
  derivedArgumentPosition?: number
}
