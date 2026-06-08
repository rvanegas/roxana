import React, {createContext, useContext, useState, useRef} from 'react'
import {Sentence} from './discussion.d'

const sessionId = crypto.randomUUID()

interface DianoiaState {
  status: 'idle' | 'loading' | 'done' | 'error'
  results: Record<string, number> | null
  resultsDiscussionId: string | null
  analyzedPosition: number | null
  startAnalysis: (steps: Array<{sentence: Sentence, displayIdx: number}>, discussionId: string, argumentPosition: number) => void
  resetAnalysis: () => void
}

const DianoiaContext = createContext<DianoiaState>({
  status: 'idle',
  results: null,
  resultsDiscussionId: null,
  analyzedPosition: null,
  startAnalysis: () => {},
  resetAnalysis: () => {},
})

export function DianoiaProvider({children}: {children: React.ReactNode}) {
  const [status, setStatus] = useState<DianoiaState['status']>('idle')
  const [results, setResults] = useState<Record<string, number> | null>(null)
  const [resultsDiscussionId, setResultsDiscussionId] = useState<string | null>(null)
  const [analyzedPosition, setAnalyzedPosition] = useState<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function resetAnalysis() {
    clearPoll()
    setStatus('idle')
    setResults(null)
    setResultsDiscussionId(null)
    setAnalyzedPosition(null)
  }

  async function startAnalysis(steps: Array<{sentence: Sentence, displayIdx: number}>, discussionId: string, argumentPosition: number) {
    const baseUrl = import.meta.env.VITE_DIANOIA_URL
    console.log('[dianoia] startAnalysis', {baseUrl, discussionId, stepCount: steps.length, argumentPosition})
    if (!baseUrl) return

    clearPoll()
    setStatus('loading')
    setResults(null)
    setResultsDiscussionId(discussionId)
    setAnalyzedPosition(argumentPosition)

    const conversationId = `${sessionId}:${discussionId}`
    const argument = steps.map(({sentence, displayIdx}) => ({
      symbol: String(displayIdx),
      proposition: sentence.content,
      justifiers: [],
      truth_score: '',
    }))

    console.log('[dianoia] POST argument', argument)

    const postUrl = `${baseUrl}/api/argument/replace?conversation_id=${encodeURIComponent(conversationId)}&snapshot_id=1`
    console.log('[dianoia] POST', postUrl)
    try {
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({assumptions: [], argument, file_ids: []}),
      })
      console.log('[dianoia] POST response', postRes.status, postRes.ok)
      if (!postRes.ok) {
        const text = await postRes.text()
        console.error('[dianoia] POST error body', text)
        throw new Error(`POST failed: ${postRes.status}`)
      }
    } catch (e) {
      console.error('[dianoia] POST catch', e)
      setStatus('error')
      return
    }

    const pollUrl = `${baseUrl}/api/agents/results?conversation_id=${encodeURIComponent(conversationId)}&snapshot_id=1`
    console.log('[dianoia] starting poll', pollUrl)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(pollUrl)
        console.log('[dianoia] poll response', res.status)
        if (!res.ok) {
          const text = await res.text()
          console.error('[dianoia] poll error body', text)
          throw new Error(`poll failed: ${res.status}`)
        }
        const data = await res.json()
        console.log('[dianoia] poll data', data)
        if (data.tasks_complete) {
          clearPoll()
          const contentResults: Array<{result_content?: {truth_evaluations?: Array<{symbol: string, truth_value: number}>}}> =
            data.results_by_agent?.content_evaluator ?? []
          console.log('[dianoia] content_evaluator results', contentResults)
          const scores: Record<string, number> = {}
          for (const r of contentResults) {
            for (const ev of r.result_content?.truth_evaluations ?? []) {
              scores[ev.symbol] = ev.truth_value
            }
          }
          console.log('[dianoia] scores', scores)
          setResults(scores)
          setStatus('done')
        }
      } catch (e) {
        console.error('[dianoia] poll catch', e)
        clearPoll()
        setStatus('error')
      }
    }, 1000)
  }

  return (
    <DianoiaContext.Provider value={{status, results, resultsDiscussionId, analyzedPosition, startAnalysis, resetAnalysis}}>
      {children}
    </DianoiaContext.Provider>
  )
}

export function useDianoia() {
  return useContext(DianoiaContext)
}
