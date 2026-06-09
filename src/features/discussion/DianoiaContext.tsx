import React, {createContext, useContext, useState, useRef} from 'react'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../app/store'
import {saveArgumentAnalysisResultsAction, deleteArgumentAnalysisResultsAction, setAnalyzingStateAction} from './data'
import {DianoiaResultData, TruthEvaluation, ValidityEvaluation,
  IncoherentSet, FormalizationItem, PropositionEvaluation} from './dianoia.types'

export type {DianoiaResultData, TruthEvaluation, ValidityEvaluation,
  IncoherentSet, FormalizationItem, PropositionEvaluation}

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
  checkRateLimited: (username: string | undefined) => boolean
  startAnalysis: (steps: AnalyzedStep[], discussionId: string, argumentPosition: number, username?: string) => void
  cancelAnalysis: () => void
  resetAnalysis: (position?: number) => void
  openView: (position: number) => void
  closeView: () => void
}

const DianoiaContext = createContext<DianoiaState>({
  status: 'idle',
  analyzedPosition: null,
  analysisViewOpen: false,
  viewPosition: null,
  checkRateLimited: () => false,
  startAnalysis: () => {},
  cancelAnalysis: () => {},
  resetAnalysis: () => {},
  openView: () => {},
  closeView: () => {},
})

export function DianoiaProvider({children}: {children: React.ReactNode}) {
  const dispatch = useDispatch<AppDispatch>()
  const [status, setStatus] = useState<DianoiaState['status']>('idle')
  const [analyzedPosition, setAnalyzedPosition] = useState<number | null>(null)
  const [analysisViewOpen, setViewOpen] = useState(false)
  const [viewPosition, setViewPosition] = useState<number | null>(null)
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

    const conversationId = `${sessionId}:${discussionId}`
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
            contentRecommendations: [],
            formalizations: [],
            propositionEvaluations: [],
            argumentValidity: null,
            formalLogicalIssues: [],
            formalRecommendations: [],
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
            merged.contentRecommendations.push(...(c.recommendations ?? []))
          }

          for (const r of (rba.formalizer ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.formalizations.push(...(c.formalizations ?? []))
          }

          for (const r of (rba.form_evaluator ?? [])) {
            const c = r.result_content
            if (!c) continue
            merged.propositionEvaluations.push(...(c.proposition_evaluations ?? []))
            if (c.argument_validity != null) merged.argumentValidity = c.argument_validity
            merged.formalLogicalIssues.push(...(c.logical_issues ?? []))
            merged.formalRecommendations.push(...(c.recommendations ?? []))
          }

          dispatch(saveArgumentAnalysisResultsAction(argumentPosition, merged))
          dispatch(setAnalyzingStateAction(null))

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

  return (
    <DianoiaContext.Provider value={{
      status, analyzedPosition, analysisViewOpen, viewPosition,
      checkRateLimited,
      startAnalysis, cancelAnalysis, resetAnalysis, openView, closeView,
    }}>
      {children}
    </DianoiaContext.Provider>
  )
}

export function useDianoia() {
  return useContext(DianoiaContext)
}
