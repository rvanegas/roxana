import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {toAlphaIndex} from '../../app/util'
import {useDianoia, DianoiaResultData, AnalyzedStep} from './DianoiaContext'
import {selectDiscussions} from './discussionsSlice'

function ScoreBadge({value}: {value: number}) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? 'seagreen' : pct >= 40 ? '#856404' : 'firebrick'
  return <span style={{color, fontWeight: 'bold'}}>{pct}%</span>
}

function ResultSection({title, children}: {title: string, children: React.ReactNode}) {
  return (
    <View style={{marginBottom: '20px'}}>
      <div style={{fontWeight: 'bold', marginBottom: '6px'}}>{title}</div>
      {children}
    </View>
  )
}

function PropIdx({symbol, symbolToIdx}: {symbol: string, symbolToIdx: Record<string, number>}) {
  return (
    <span style={{fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontWeight: 'bold', marginRight: '8px'}}>
      {symbolToIdx[symbol] ?? symbol}
    </span>
  )
}

function ResultsPanel({data, steps}: {data: DianoiaResultData, steps: AnalyzedStep[]}) {
  const symbolToIdx = Object.fromEntries(steps.map(s => [String(s.displayIdx), s.displayIdx]))

  const symbolOrder = steps.map(s => String(s.displayIdx))
  function byArgOrder<T extends {symbol: string}>(items: T[]): T[] {
    return [...items].sort((a, b) => symbolOrder.indexOf(a.symbol) - symbolOrder.indexOf(b.symbol))
  }

  const hasFormalizations = data.formalizations.length > 0
  const hasTruth = data.truthEvaluations.length > 0
  const hasValidity = data.validityEvaluations.length > 0

  const hasContentIssues = data.contentLogicalIssues.length > 0
  const hasContentRecs = data.contentRecommendations.length > 0
  const hasPropEvals = data.propositionEvaluations.length > 0
  const hasFormalIssues = data.formalLogicalIssues.length > 0
  const hasFormalRecs = data.formalRecommendations.length > 0
  const hasArgValidity = data.argumentValidity !== null

  const hasAnything = hasFormalizations || hasTruth || hasValidity
    || hasContentIssues || hasContentRecs || hasPropEvals || hasFormalIssues
    || hasFormalRecs || hasArgValidity

  if (!hasAnything) {
    return <span style={{color: '#888'}}>No results available.</span>
  }

  return (
    <View>
      {hasTruth && (
        <ResultSection title="Truth">
          {byArgOrder(data.truthEvaluations).map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <PropIdx symbol={ev.symbol} symbolToIdx={symbolToIdx} />
              <ScoreBadge value={ev.truth_value} />
              {ev.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}

      {hasValidity && (
        <ResultSection title="Content validity">
          {byArgOrder(data.validityEvaluations).map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <PropIdx symbol={ev.symbol} symbolToIdx={symbolToIdx} />
              <ScoreBadge value={ev.validity_value} />
              {ev.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}

      {hasFormalizations && (
        <ResultSection title="Formalizations">
          {byArgOrder(data.formalizations).map((f, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <PropIdx symbol={f.symbol} symbolToIdx={symbolToIdx} />
              <code style={{fontSize: '0.9em'}}>{f.ascii}</code>
            </View>
          ))}
        </ResultSection>
      )}

      {hasPropEvals && (
        <ResultSection title={`Formal validity${hasArgValidity ? ` — argument: ${Math.round(data.argumentValidity! * 100)}%` : ''}`}>
          {byArgOrder(data.propositionEvaluations).map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <PropIdx symbol={ev.symbol} symbolToIdx={symbolToIdx} />
              <ScoreBadge value={ev.validity} />
              {ev.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}



      {(hasFormalIssues || hasContentIssues) && (
        <ResultSection title="Logical issues">
          <ul style={{margin: 0, paddingLeft: '20px'}}>
            {data.formalLogicalIssues.map((issue, i) => (
              <li key={`f${i}`} style={{marginBottom: '4px'}}>{issue}</li>
            ))}
            {data.contentLogicalIssues.map((issue, i) => (
              <li key={`c${i}`} style={{marginBottom: '4px'}}>{issue}</li>
            ))}
          </ul>
        </ResultSection>
      )}

      {(hasFormalRecs || hasContentRecs) && (
        <ResultSection title="Recommendations">
          <ul style={{margin: 0, paddingLeft: '20px'}}>
            {data.formalRecommendations.map((rec, i) => (
              <li key={`f${i}`} style={{marginBottom: '4px'}}>{rec}</li>
            ))}
            {data.contentRecommendations.map((rec, i) => (
              <li key={`c${i}`} style={{marginBottom: '4px'}}>{rec}</li>
            ))}
          </ul>
        </ResultSection>
      )}
    </View>
  )
}

export function DianoiaView() {
  const {viewPosition, closeView} = useDianoia()
  const discussions = useSelector(selectDiscussions)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeView()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeView])

  if (viewPosition === null) return null
  const data = discussions.analysisResults?.[viewPosition]
  const argument = discussions.arguments[viewPosition]
  const propIndexes = argument?.content
    ? argument.content.split(/\s+/).map(Number).filter(n => n > 0)
    : []
  const steps: AnalyzedStep[] = propIndexes
    .map(idx => {
      const sentence = discussions.propositions[idx - 1]
      return sentence ? {sentence, displayIdx: idx} : null
    })
    .filter(Boolean) as AnalyzedStep[]

  return (
    <View style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'white', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <View style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '10px 16px', borderBottom: '1px solid #ccc',
        flexShrink: 0,
      }}>
        <Button variation="link" size="small" onClick={closeView}>← back</Button>
        <Heading level={5} style={{margin: 0}}>
          Argument{' '}
          <span style={{fontFamily: 'Comic Sans MS, Comic Sans, cursive'}}>
            {toAlphaIndex(viewPosition)}
          </span>
          {' '}— Analysis
        </Heading>
      </View>

      <View style={{flex: 1, display: 'flex', minHeight: 0}}>
        <View style={{
          width: '320px', flexShrink: 0,
          padding: '16px', borderRight: '1px solid #ccc',
          overflowY: 'auto',
        }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Propositions</div>
          {steps.map(({sentence, displayIdx}, i) => (
            <View key={i} style={{display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start'}}>
              <span style={{
                fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontWeight: 'bold',
                minWidth: '20px', flexShrink: 0,
              }}>
                {displayIdx}
              </span>
              <span style={{color: '#333'}}>{sentence.content}</span>
            </View>
          ))}
        </View>

        <View style={{flex: 1, padding: '16px', overflowY: 'auto'}}>
          {data ? (
            <ResultsPanel data={data} steps={steps} />
          ) : (
            <span style={{color: '#888'}}>Results not yet available.</span>
          )}
        </View>
      </View>
    </View>
  )
}
