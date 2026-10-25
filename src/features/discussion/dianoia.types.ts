// dianoia's own shapes come from its published contract. dianoia.openapi.ts is
// generated from https://dianoia.rvanegas.co/openapi.json by
// `npm run dianoia-types` and is never edited by hand; regenerate it whenever
// dianoia's schemas/api_results.py changes (rvanegas-site SITE.md, Phase 4).
// The names below are Roxana's for those shapes.
import type {components} from './dianoia.openapi'

type Schemas = components['schemas']

export type TruthEvaluation = Schemas['TruthEvaluation']
export type ValidityEvaluation = Schemas['ValidityEvaluation']
export type IncoherentSet = Schemas['IncoherentSet']
export type FormalizationItem = Schemas['FormalizationItem']
export type PropositionEvaluation = Schemas['PropositionEvaluation']
export type PhrasingEvaluation = Schemas['PhrasingEvaluation']
export type PropositionChange = Schemas['ImprovementProposition']
export type ExpectedConclusionImprovement = Schemas['ExpectedConclusionImprovement']
export type ImproverRecommendation = Schemas['ImprovementRecommendation']
export type AuditFinding = Schemas['AuditFinding']
export type AuditResult = Schemas['AuditResult']
export type AgentResultsResponse = Schemas['AgentResultsResponse']

// Roxana's own: the merged view of one argument's analysis, persisted with the
// discussion, so it is not dianoia's to define.
export interface DianoiaResultData {
  // truth_evaluator and content_validity_evaluator
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
