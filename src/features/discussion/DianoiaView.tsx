import React, {useEffect} from 'react'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {toAlphaIndex} from '../../app/util'
import {useDianoia, DianoiaResultData, AnalyzedStep} from './DianoiaContext'

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

function ResultsPanel({data, steps}: {data: DianoiaResultData, steps: AnalyzedStep[]}) {
  const symbolToIdx = Object.fromEntries(steps.map(s => [String(s.displayIdx), s.displayIdx]))

  const hasTruth = data.truthEvaluations.length > 0
  const hasValidity = data.validityEvaluations.length > 0
  const hasIncoherent = data.incoherentSets.length > 0
  const hasIssues = data.logicalIssues.length > 0
  const hasRecs = data.recommendations.length > 0

  return (
    <View>
      {hasTruth && (
        <ResultSection title="Truth">
          {data.truthEvaluations.map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <span style={{fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontWeight: 'bold', marginRight: '8px'}}>
                {symbolToIdx[ev.symbol] ?? ev.symbol}
              </span>
              <ScoreBadge value={ev.truth_value} />
              {ev.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}

      {hasValidity && (
        <ResultSection title="Validity">
          {data.validityEvaluations.map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <span style={{fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontWeight: 'bold', marginRight: '8px'}}>
                {symbolToIdx[ev.symbol] ?? ev.symbol}
              </span>
              <ScoreBadge value={ev.validity_value} />
              {ev.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}

      {hasIncoherent && (
        <ResultSection title="Incoherent Sets">
          {data.incoherentSets.map((set, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <span style={{fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontWeight: 'bold', marginRight: '8px'}}>
                {set.symbols.map(s => symbolToIdx[s] ?? s).join(', ')}
              </span>
              <ScoreBadge value={set.incoherence_value} />
              {set.reasoning && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{set.reasoning}</div>
              )}
            </View>
          ))}
        </ResultSection>
      )}

      {hasIssues && (
        <ResultSection title="Logical Issues">
          <ul style={{margin: 0, paddingLeft: '20px'}}>
            {data.logicalIssues.map((issue, i) => (
              <li key={i} style={{marginBottom: '4px'}}>{issue}</li>
            ))}
          </ul>
        </ResultSection>
      )}

      {hasRecs && (
        <ResultSection title="Recommendations">
          <ul style={{margin: 0, paddingLeft: '20px'}}>
            {data.recommendations.map((rec, i) => (
              <li key={i} style={{marginBottom: '4px'}}>{rec}</li>
            ))}
          </ul>
        </ResultSection>
      )}

      {!hasTruth && !hasValidity && !hasIncoherent && !hasIssues && !hasRecs && (
        <span style={{color: '#888'}}>No results available.</span>
      )}
    </View>
  )
}

export function DianoiaView() {
  const {viewPosition, results, analyzedSteps, closeView} = useDianoia()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeView()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeView])

  if (viewPosition === null) return null
  const data = results[viewPosition]
  const steps = analyzedSteps[viewPosition] ?? []

  return (
    <View style={{
      position: 'absolute', inset: 0, zIndex: 100,
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
