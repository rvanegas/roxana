import React, {createContext, useContext, useState, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch} from '../../app/store'
import {selectDiscussions, propositionIndexesFromArgument} from './discussionsSlice'
import {saveArgumentAnalysisResultsAction, deleteArgumentAnalysisResultsAction,
  setAnalyzingStateAction, saveAuditResultAction} from './data'
import {DianoiaResultData, TruthEvaluation, ValidityEvaluation,
  IncoherentSet, FormalizationItem, PropositionEvaluation,
  PhrasingEvaluation, ImproverRecommendation, AuditFinding, AuditResult} from './dianoia.types'

export type {DianoiaResultData, TruthEvaluation, ValidityEvaluation,
  IncoherentSet, FormalizationItem, PropositionEvaluation,
  PhrasingEvaluation, ImproverRecommendation, AuditFinding, AuditResult}

export type AnalyzedStep = {sentence: {content: string}, displayIdx: number}

const sessionId = crypto.randomUUID()

const whitelist = new Set(
  (import.meta.env.VITE_DIANOIA_WHITELIST ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)
)

const LAST_ANALYZED_KEY = 'dianoia:lastAnalyzed'

function isToday(isoString: string): boolean {
  return new Date(isoString).toDateString() === new Date().toDateString()
}

function isRateLimited(username: string | undefined): boolean {
  if (!username || whitelist.has(username)) return false
  const stored = localStorage.getItem(LAST_ANALYZED_KEY)
  return stored !== null && isToday(stored)
}

interface DianoiaState {
  status: 'idle' | 'loading' | 'done' | 'error'
  analyzedPosition: number | null
  analysisViewOpen: boolean
  viewPosition: number | null
  auditStatus: 'idle' | 'loading' | 'error'
  auditViewOpen: boolean
  checkRateLimited: (username: string | undefined) => boolean
  startAnalysis: (steps: AnalyzedStep[], discussionId: string, argumentPosition: number, username?: string) => void
  cancelAnalysis: () => void
  resetAnalysis: (position?: number) => void
  openView: (position: number) => void
  closeView: () => void
  runAudit: () => void
  openAuditView: () => void
  closeAuditView: () => void
}

const DianoiaContext = createContext<DianoiaState>({
  status: 'idle',
  analyzedPosition: null,
  analysisViewOpen: false,
  viewPosition: null,
  auditStatus: 'idle',
  auditViewOpen: false,
  checkRateLimited: () => false,
  startAnalysis: () => {},
  cancelAnalysis: () => {},
  resetAnalysis: () => {},
  openView: () => {},
  closeView: () => {},
  runAudit: () => {},
  openAuditView: () => {},
  closeAuditView: () => {},
})

export function DianoiaProvider({children}: {children: React.ReactNode}) {
  const dispatch = useDispatch<AppDispatch>()
  const discussions = useSelector(selectDiscussions)
  const [status, setStatus] = useState<DianoiaState['status']>('idle')
  const [analyzedPosition, setAnalyzedPosition] = useState<number | null>(null)
  const [analysisViewOpen, setViewOpen] = useState(false)
  const [viewPosition, setViewPosition] = useState<number | null>(null)
  const [auditStatus, setAuditStatus] = useState<DianoiaState['auditStatus']>('idle')
  const [auditViewOpen, setAuditViewOpen] = useState(false)
  const [lastAnalyzedStamp, setLastAnalyzedStamp] = useState<string | null>(
    () => localStorage.getItem(LAST_ANALYZED_KEY)
  )
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function checkRateLimited(username: string | undefined): boolean {
    if (!username || whitelist.has(username)) return false
    return lastAnalyzedStamp !== null && isToday(lastAnalyzedStamp)
  }

  function cancelAnalysis() {
    clearPoll()
    setStatus('idle')
    setAnalyzedPosition(null)
    dispatch(setAnalyzingStateAction(null))
  }

  function resetAnalysis(position?: number) {
    if (position === undefined) {
      clearPoll()
      setStatus('idle')
      setAnalyzedPosition(null)
      setViewOpen(false)
      setViewPosition(null)
      if (discussions.analyzingState !== null) dispatch(setAnalyzingStateAction(null))
    } else {
      if (analyzedPosition === position) {
        clearPoll()
        setStatus('idle')
        setAnalyzedPosition(null)
      }
      if (viewPosition === position) {
        setViewOpen(false)
        setViewPosition(null)
      }
      if (discussions.analyzingState?.position === position) dispatch(setAnalyzingStateAction(null))
      dispatch(deleteArgumentAnalysisResultsAction(position))
    }
  }

  function openView(position: number) {
    setViewPosition(position)
    setViewOpen(true)
  }

  function closeView() {
    setViewOpen(false)
  }

  async function startAnalysis(steps: AnalyzedStep[], discussionId: string, argumentPosition: number, username?: string) {
    const baseUrl = import.meta.env.VITE_DIANOIA_URL
    if (!baseUrl) return
    if (isRateLimited(username)) return

    clearPoll()
    setStatus('loading')
    setAnalyzedPosition(argumentPosition)
    dispatch(setAnalyzingStateAction({position: argumentPosition, username: username ?? ''}))

    // Roxana analyzes one argument at a time with no progressive display, so each
    // request must be stateless. Dianoia keys all retained agent results on
    // conversation_id and inherits results from earlier snapshots of the *same*
    // conversation (the noesis "progressive" model, where a stable conversation_id
    // + incrementing snapshot_id lets later evaluations build on earlier ones).
    // Reusing one conversation_id per discussion here caused a second argument's
    // improver to inherit the first argument's (now stale) proposition results.
    // A fresh conversation_id per analysis isolates the request: the backend has
    // no prior snapshot to inherit, giving us the stateless workflow while noesis
    // keeps the progressive one by reusing its conversation_id.
    const conversationId = `${sessionId}:${discussionId}:${argumentPosition}:${crypto.randomUUID()}`
    const symbols = steps.map(({displayIdx}) => String(displayIdx))
    const argument = steps.map(({sentence, displayIdx}, i) => ({
      symbol: String(displayIdx),
      proposition: sentence.content,
      justifiers: i === steps.length - 1 ? symbols.slice(0, -1) : [],
      truth_score: '',
    }))

    const postUrl = `${baseUrl}/api/argument/replace?conversation_id=${encodeURIComponent(conversationId)}&snapshot_id=1`
    try {
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({assumptions: [], argument, file_ids: []}),
      })
      if (!postRes.ok) throw new Error(`POST failed: ${postRes.status}`)
    } catch (e) {
      console.error('[dianoia] POST error', e)
      setStatus('error')
      return
    }

    const pollUrl = `${baseUrl}/api/agents/results?conversation_id=${encodeURIComponent(conversationId)}&snapshot_id=1`
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(pollUrl)
        if (!res.ok) throw new Error(`poll failed: ${res.status}`)
        const data = await res.json()
        if (data.tasks_complete) {
          clearPoll()
          const rba = data.results_by_agent ?? {}

          const merged: DianoiaResultData = {
            truthEvaluations: [],
            validityEvaluations: [],
            incoherentSets: [],
            contentLogicalIssues: [],
            formalizations: [],
            phrasingEvaluations: [],
            propositionEvaluations: [],
            argumentValidity: null,
            formalLogicalIssues: [],
            improverRecommendations: [],
          }

          for (const r of (rba.truth_evaluator ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.truthEvaluations.push(...(c.truth_evaluations ?? []))
            merged.incoherentSets.push(...(c.incoherent_sets ?? []))
          }

          for (const r of (rba.content_validity_evaluator ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.validityEvaluations.push(...(c.validity_evaluations ?? []))
            merged.contentLogicalIssues.push(...(c.logical_issues ?? []))
          }

          for (const r of (rba.formalizer ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.formalizations.push(...(c.formalizations ?? []))
          }

          for (const r of (rba.phrasing_evaluator ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.phrasingEvaluations!.push(...(c.phrasing_evaluations ?? []))
          }

          for (const r of (rba.form_evaluator ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.propositionEvaluations.push(...(c.proposition_evaluations ?? []))
            if (c.argument_validity != null) merged.argumentValidity = c.argument_validity
            merged.formalLogicalIssues.push(...(c.logical_issues ?? []))
          }

          for (const r of (rba.improver ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.improverRecommendations!.push(...(c.recommendations ?? []))
          }

          dispatch(saveArgumentAnalysisResultsAction(argumentPosition, merged))

          if (!whitelist.has(username ?? '')) {
            const stamp = new Date().toISOString()
            localStorage.setItem(LAST_ANALYZED_KEY, stamp)
            setLastAnalyzedStamp(stamp)
          }
          setStatus('done')
        }
      } catch (e) {
        console.error('[dianoia] poll error', e)
        clearPoll()
        setStatus('error')
      }
    }, 1000)
  }

  async function runAudit() {
    const baseUrl = import.meta.env.VITE_DIANOIA_URL
    if (!baseUrl) return

    // The audit covers the whole graph: every proposition is a step, and each
    // argument sentence ("1 2 3" = justifiers then conclusion) contributes
    // justifier edges to its concluding proposition.
    const justifiersBySymbol: Record<string, Set<string>> = {}
    for (const argument of discussions.arguments) {
      const indexes = propositionIndexesFromArgument(argument)
      if (indexes.length < 2) continue
      const conclusion = String(indexes[indexes.length - 1])
      justifiersBySymbol[conclusion] ??= new Set()
      for (const index of indexes.slice(0, -1)) {
        justifiersBySymbol[conclusion].add(String(index))
      }
    }
    const argument = discussions.propositions
      .map((sentence: {content: string}, i: number) => ({
        symbol: String(i + 1),
        proposition: sentence.content,
        justifiers: Array.from(justifiersBySymbol[String(i + 1)] ?? []),
        truth_score: '',
      }))
      .filter((step: {proposition: string}) => step.proposition.trim() !== '')

    setAuditStatus('loading')
    try {
      const res = await fetch(`${baseUrl}/api/argument/audit`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({argument, file_ids: []}),
      })
      if (!res.ok) throw new Error(`audit failed: ${res.status}`)
      const result: AuditResult = await res.json()
      dispatch(saveAuditResultAction(result))
      setAuditStatus('idle')
      setAuditViewOpen(true)
    } catch (e) {
      console.error('[dianoia] audit error', e)
      setAuditStatus('error')
    }
  }

  function openAuditView() {
    setAuditViewOpen(true)
  }

  function closeAuditView() {
    setAuditViewOpen(false)
  }

  return (
    <DianoiaContext.Provider value={{
      status, analyzedPosition, analysisViewOpen, viewPosition,
      auditStatus, auditViewOpen,
      checkRateLimited,
      startAnalysis, cancelAnalysis, resetAnalysis, openView, closeView,
      runAudit, openAuditView, closeAuditView,
    }}>
      {children}
    </DianoiaContext.Provider>
  )
}

export function useDianoia() {
  return useContext(DianoiaContext)
}
