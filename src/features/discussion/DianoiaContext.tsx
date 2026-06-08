import React, {createContext, useContext, useState, useRef} from 'react'
import {Sentence} from './discussion.d'

const sessionId = crypto.randomUUID()

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

export interface DianoiaResultData {
  truthEvaluations: TruthEvaluation[]
  validityEvaluations: ValidityEvaluation[]
  incoherentSets: IncoherentSet[]
  logicalIssues: string[]
  recommendations: string[]
}

export type AnalyzedStep = {sentence: Sentence, displayIdx: number}

interface DianoiaState {
  status: 'idle' | 'loading' | 'done' | 'error'
  results: Record<number, DianoiaResultData>
  analyzedSteps: Record<number, AnalyzedStep[]>
  resultsDiscussionId: string | null
  analyzedPosition: number | null
  viewOpen: boolean
  viewPosition: number | null
  startAnalysis: (steps: AnalyzedStep[], discussionId: string, argumentPosition: number) => void
  cancelAnalysis: () => void
  resetAnalysis: (position?: number) => void
  openView: (position: number) => void
  closeView: () => void
}

const DianoiaContext = createContext<DianoiaState>({
  status: 'idle',
  results: {},
  analyzedSteps: {},
  resultsDiscussionId: null,
  analyzedPosition: null,
  viewOpen: false,
  viewPosition: null,
  startAnalysis: () => {},
  cancelAnalysis: () => {},
  resetAnalysis: () => {},
  openView: () => {},
  closeView: () => {},
})

export function DianoiaProvider({children}: {children: React.ReactNode}) {
  const [status, setStatus] = useState<DianoiaState['status']>('idle')
  const [results, setResults] = useState<Record<number, DianoiaResultData>>({})
  const [analyzedSteps, setAnalyzedSteps] = useState<Record<number, AnalyzedStep[]>>({})
  const [resultsDiscussionId, setResultsDiscussionId] = useState<string | null>(null)
  const [analyzedPosition, setAnalyzedPosition] = useState<number | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewPosition, setViewPosition] = useState<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function cancelAnalysis() {
    clearPoll()
    setStatus('idle')
    setAnalyzedPosition(null)
  }

  function resetAnalysis(position?: number) {
    if (position === undefined) {
      clearPoll()
      setStatus('idle')
      setResults({})
      setAnalyzedSteps({})
      setResultsDiscussionId(null)
      setAnalyzedPosition(null)
      setViewOpen(false)
      setViewPosition(null)
    } else {
      setResults(prev => {
        const next = {...prev}
        delete next[position]
        return next
      })
      setAnalyzedSteps(prev => {
        const next = {...prev}
        delete next[position]
        return next
      })
      if (analyzedPosition === position) {
        clearPoll()
        setStatus('idle')
        setAnalyzedPosition(null)
      }
      if (viewPosition === position) {
        setViewOpen(false)
        setViewPosition(null)
      }
    }
  }

  function openView(position: number) {
    setViewPosition(position)
    setViewOpen(true)
  }

  function closeView() {
    setViewOpen(false)
  }

  async function startAnalysis(steps: AnalyzedStep[], discussionId: string, argumentPosition: number) {
    const baseUrl = import.meta.env.VITE_DIANOIA_URL
    if (!baseUrl) return

    clearPoll()
    setStatus('loading')
    setResultsDiscussionId(discussionId)
    setAnalyzedPosition(argumentPosition)
    setAnalyzedSteps(prev => ({...prev, [argumentPosition]: steps}))

    const conversationId = `${sessionId}:${discussionId}`
    const argument = steps.map(({sentence, displayIdx}) => ({
      symbol: String(displayIdx),
      proposition: sentence.content,
      justifiers: [],
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
          const contentResults: Array<{result_content?: {
            truth_evaluations?: TruthEvaluation[]
            validity_evaluations?: ValidityEvaluation[]
            incoherent_sets?: IncoherentSet[]
            logical_issues?: string[]
            recommendations?: string[]
          }}> = data.results_by_agent?.content_evaluator ?? []

          const merged: DianoiaResultData = {
            truthEvaluations: [],
            validityEvaluations: [],
            incoherentSets: [],
            logicalIssues: [],
            recommendations: [],
          }
          for (const r of contentResults) {
            const c = r.result_content
            if (!c) continue
            merged.truthEvaluations.push(...(c.truth_evaluations ?? []))
            merged.validityEvaluations.push(...(c.validity_evaluations ?? []))
            merged.incoherentSets.push(...(c.incoherent_sets ?? []))
            merged.logicalIssues.push(...(c.logical_issues ?? []))
            merged.recommendations.push(...(c.recommendations ?? []))
          }

          setResults(prev => ({...prev, [argumentPosition]: merged}))
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
      status, results, analyzedSteps, resultsDiscussionId, analyzedPosition,
      viewOpen, viewPosition,
      startAnalysis, cancelAnalysis, resetAnalysis, openView, closeView,
    }}>
      {children}
    </DianoiaContext.Provider>
  )
}

export function useDianoia() {
  return useContext(DianoiaContext)
}
