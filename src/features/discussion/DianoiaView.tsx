import React, {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {AppDispatch} from '../../app/store'
import {toAlphaIndex} from '../../app/util'
import {useDianoia, DianoiaResultData, ImproverRecommendation, AnalyzedStep} from './DianoiaContext'
import {selectDiscussions} from './discussionsSlice'
import {applyRecommendationAddAction, applyRecommendationRewriteAction, isActionable} from './data'

function buildCopyText(argLabel: string, steps: AnalyzedStep[], data: DianoiaResultData | undefined): string {
  const lines: string[] = [`Argument ${argLabel} — Analysis`, '']

  if (steps.length > 0) {
    lines.push('Propositions')
    for (const {sentence, displayIdx} of steps) {
      lines.push(`  ${displayIdx}. ${sentence.content}`)
    }
    lines.push('')
  }

  if (!data) return lines.join('\n').trimEnd()

  const symbolOrder = steps.map(s => String(s.displayIdx))
  function byOrder<T extends {symbol: string}>(items: T[]): T[] {
    return [...items].sort((a, b) => symbolOrder.indexOf(a.symbol) - symbolOrder.indexOf(b.symbol))
  }

  if (data.truthEvaluations.length > 0) {
    lines.push('Truth')
    for (const ev of byOrder(data.truthEvaluations)) {
      lines.push(`  ${ev.symbol}: ${Math.round(ev.truth_value * 100)}%${ev.reasoning ? ' — ' + ev.reasoning : ''}`)
    }
    lines.push('')
  }

  if (data.validityEvaluations.length > 0) {
    lines.push('Content validity')
    for (const ev of byOrder(data.validityEvaluations)) {
      lines.push(`  ${ev.symbol}: ${Math.round(ev.validity_value * 100)}%${ev.reasoning ? ' — ' + ev.reasoning : ''}`)
    }
    lines.push('')
  }

  if (data.formalizations.length > 0) {
    lines.push('Formalizations')
    for (const f of byOrder(data.formalizations)) {
      lines.push(`  ${f.symbol}: ${f.ascii}`)
    }
    lines.push('')
  }

  if (data.propositionEvaluations.length > 0) {
    lines.push('Formal validity')
    for (const ev of byOrder(data.propositionEvaluations)) {
      lines.push(`  ${ev.symbol}: ${Math.round(ev.validity * 100)}%${ev.reasoning ? ' — ' + ev.reasoning : ''}`)
    }
    lines.push('')
  }

  const phrasingEvaluations = data.phrasingEvaluations ?? []
  if (phrasingEvaluations.length > 0) {
    lines.push('Phrasing')
    for (const ev of byOrder(phrasingEvaluations)) {
      lines.push(`  ${ev.symbol}: ${ev.issues.join('; ')} — ${ev.recommendation}`)
    }
    lines.push('')
  }

  const allIssues = [...data.formalLogicalIssues, ...data.contentLogicalIssues]
  if (allIssues.length > 0) {
    lines.push('Logical issues')
    for (const issue of allIssues) lines.push(`  - ${issue}`)
    lines.push('')
  }

  const recs = data.improverRecommendations ?? []
  if (recs.length > 0) {
    lines.push('Recommendations')
    for (const rec of recs) {
      lines.push(`  [${rec.impact}] targets ${rec.target_proposition}: ${rec.reasoning}`)
      for (const p of rec.propositions) {
        if (p.type === 'rewrite') {
          lines.push(`    rewrite ${p.original_symbol ?? '?'}: ${p.proposition}`)
        } else {
          lines.push(`    new${p.justifies_symbol ? ` (justifies ${p.justifies_symbol})` : ''}: ${p.proposition}`)
        }
      }
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

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
    <span style={{fontWeight: 'bold', marginRight: '8px'}}>
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
  const hasPropEvals = data.propositionEvaluations.length > 0
  const hasFormalIssues = data.formalLogicalIssues.length > 0
  const improverRecommendations = data.improverRecommendations ?? []
  const hasRecs = improverRecommendations.length > 0
  const phrasingEvaluations = data.phrasingEvaluations ?? []
  const hasPhrasing = phrasingEvaluations.length > 0

  const hasAnything = hasFormalizations || hasTruth || hasValidity
    || hasContentIssues || hasPropEvals || hasFormalIssues
    || hasRecs || hasPhrasing

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
        <ResultSection title="Formal validity">
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



      {hasPhrasing && (
        <ResultSection title="Phrasing">
          {byArgOrder(phrasingEvaluations).map((ev, i) => (
            <View key={i} style={{marginBottom: '10px'}}>
              <PropIdx symbol={ev.symbol} symbolToIdx={symbolToIdx} />
              <span style={{color: '#444'}}>{ev.issues.join('; ')}</span>
              {ev.recommendation && (
                <div style={{marginTop: '2px', marginLeft: '20px', color: '#444'}}>{ev.recommendation}</div>
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

      {hasRecs && (
        <ResultSection title="Recommendations">
          {improverRecommendations.map((rec, i) => (
            <RecommendationCard key={rec.id ?? i} rec={rec} symbolToIdx={symbolToIdx} />
          ))}
        </ResultSection>
      )}
    </View>
  )
}

const IMPACT_COLOR: Record<string, string> = {
  high: 'firebrick', medium: '#856404', low: '#555',
}

function PropositionChangeRow(
  {change, fallbackJustifies, symbolToIdx}: {
    change: ImproverRecommendation['propositions'][number],
    fallbackJustifies: string,
    symbolToIdx: Record<string, number>,
  }
) {
  const dispatch = useDispatch<AppDispatch>()
  const discussions = useSelector(selectDiscussions)
  const [applied, setApplied] = useState<'' | 'added' | 'rewritten'>('')

  const isRewrite = change.type === 'rewrite'
  const label = isRewrite
    ? `Rewrite ${change.original_symbol != null ? (symbolToIdx[change.original_symbol] ?? change.original_symbol) : ''}`
    : `New${change.justifies_symbol != null ? ` → ${symbolToIdx[change.justifies_symbol] ?? change.justifies_symbol}` : ''}`

  const username = discussions.username
  const targetPosition = change.original_symbol != null ? Number(change.original_symbol) - 1 : -1
  const targetSentence = discussions.propositions[targetPosition]
  const canRewrite = !!username && !!targetSentence && isActionable.edit(targetSentence, username)

  function handleAdd() {
    const justifiesSymbol = isRewrite ? null : (change.justifies_symbol ?? fallbackJustifies ?? null)
    dispatch(applyRecommendationAddAction({content: change.proposition, justifiesSymbol}))
    setApplied('added')
  }

  function handleRewrite() {
    if (!canRewrite) return
    dispatch(applyRecommendationRewriteAction({position: targetPosition, content: change.proposition}))
    setApplied('rewritten')
  }

  return (
    <View style={{marginTop: '6px', marginLeft: '20px'}}>
      <span style={{
        display: 'inline-block', fontSize: '0.75em', fontWeight: 'bold',
        textTransform: 'uppercase', color: isRewrite ? '#856404' : 'seagreen',
        marginRight: '8px',
      }}>
        {label}
      </span>
      <span style={{color: '#333'}}>{change.proposition}</span>
      <div style={{marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center'}}>
        {applied ? (
          <span style={{color: 'seagreen', fontSize: '0.85em'}}>
            ✓ {applied === 'rewritten' ? 'Rewritten in place' : 'Added'}
          </span>
        ) : (
          <>
            <Button size="small" variation="link" onClick={handleAdd}>Add</Button>
            {isRewrite && (
              <Button
                size="small"
                variation="link"
                onClick={handleRewrite}
                isDisabled={!canRewrite}
                title={canRewrite
                  ? 'Replace the target proposition in place'
                  : 'Target is in an argument or committed by others — unfreeze it first to rewrite in place'}
              >
                Rewrite
              </Button>
            )}
          </>
        )}
      </div>
    </View>
  )
}

function RecommendationCard(
  {rec, symbolToIdx}: {rec: ImproverRecommendation, symbolToIdx: Record<string, number>}
) {
  return (
    <View style={{
      marginBottom: '14px', paddingLeft: '10px',
      borderLeft: `3px solid ${IMPACT_COLOR[rec.impact] ?? '#ccc'}`,
    }}>
      <div style={{marginBottom: '2px'}}>
        <span style={{
          fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase',
          color: IMPACT_COLOR[rec.impact] ?? '#555', marginRight: '8px',
        }}>
          {rec.impact} impact
        </span>
        {rec.target_proposition && (
          <span style={{color: '#888', fontSize: '0.85em'}}>
            targets {symbolToIdx[rec.target_proposition] ?? rec.target_proposition}
          </span>
        )}
      </div>
      <div style={{color: '#444'}}>{rec.reasoning}</div>
      {rec.propositions.map((change, i) => (
        <PropositionChangeRow
          key={i}
          change={change}
          fallbackJustifies={rec.target_proposition}
          symbolToIdx={symbolToIdx}
        />
      ))}
    </View>
  )
}

export function DianoiaView() {
  const {viewPosition, closeView} = useDianoia()
  const discussions = useSelector(selectDiscussions)
  const [copied, setCopied] = useState(false)

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
    <>
      <style>{`
        .dianoia-content { display: flex; flex: 1; min-height: 0; }
        .dianoia-props { width: 320px; flex-shrink: 0; padding: 16px; border-right: 1px solid #ccc; overflow-y: auto; }
        .dianoia-results { flex: 1; padding: 16px; overflow-y: auto; }
        @media (max-width: 600px) {
          .dianoia-content { flex-direction: column; flex: none; }
          .dianoia-props { width: auto; border-right: none; border-bottom: 1px solid #ccc; overflow-y: visible; }
          .dianoia-results { overflow-y: visible; }
        }
      `}</style>
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
          <Heading level={5} style={{margin: 0, flex: 1}}>
            Argument{' '}
            {toAlphaIndex(viewPosition)}
            {' '}— Analysis
          </Heading>
          <Button
            variation="link"
            size="small"
            title="Copy to clipboard"
            onClick={() => {
              const text = buildCopyText(toAlphaIndex(viewPosition), steps, data)
              navigator.clipboard.writeText(text).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l4 4 8-8" stroke="seagreen" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="4" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="white"/>
              </svg>
            )}
          </Button>
        </View>

        <div className="dianoia-content">
          <div className="dianoia-props">
            <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Propositions</div>
            {steps.map(({sentence, displayIdx}, i) => (
              <View key={i} style={{display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{
                  fontWeight: 'bold',
                  minWidth: '20px', flexShrink: 0,
                }}>
                  {displayIdx}
                </span>
                <span style={{color: '#333'}}>{sentence.content}</span>
              </View>
            ))}
          </div>

          <div className="dianoia-results">
            {data ? (
              <ResultsPanel data={data} steps={steps} />
            ) : (
              <span style={{color: '#888'}}>Results not yet available.</span>
            )}
          </div>
        </div>
      </View>
    </>
  )
}
