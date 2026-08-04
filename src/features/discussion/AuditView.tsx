import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {useDianoia, AuditFinding} from './DianoiaContext'
import {selectDiscussions} from './discussionsSlice'

const conditionTitles: Record<AuditFinding['condition'], string> = {
  connectivity: 'Connectivity',
  conclusion: 'Conclusion',
  integrity: 'Integrity',
  circular: 'Circular Reasoning',
}

function FindingCard({finding}: {finding: AuditFinding}) {
  const title = conditionTitles[finding.condition] ?? finding.condition
  return (
    <View style={{marginBottom: '20px'}}>
      <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
        {title}
        {finding.step_symbols.length > 0 && (
          <span style={{fontWeight: 'normal', color: '#666'}}>
            {' '}— proposition{finding.step_symbols.length > 1 ? 's' : ''} {finding.step_symbols.join(', ')}
          </span>
        )}
      </div>
      <div style={{color: '#444'}}>{finding.issue}</div>
      <div style={{marginTop: '4px', color: '#444'}}>
        <span style={{fontWeight: 'bold'}}>Fix: </span>{finding.pointer}
      </div>
    </View>
  )
}

export function AuditView() {
  const {closeAuditView} = useDianoia()
  const discussions = useSelector(selectDiscussions)
  const audit = discussions.auditResult

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAuditView()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeAuditView])

  if (!audit) return null
  const flagged = new Set(audit.findings.flatMap(f => f.step_symbols))

  return (
    <>
      <style>{`
        .audit-content { display: flex; flex: 1; min-height: 0; }
        .audit-props { width: 320px; flex-shrink: 0; padding: 16px; border-right: 1px solid #ccc; overflow-y: auto; }
        .audit-results { flex: 1; padding: 16px; overflow-y: auto; }
        @media (max-width: 600px) {
          .audit-content { flex-direction: column; flex: none; }
          .audit-props { width: auto; border-right: none; border-bottom: 1px solid #ccc; overflow-y: visible; }
          .audit-results { overflow-y: visible; }
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
          <Button variation="link" size="small" onClick={closeAuditView}>← back</Button>
          <Heading level={5} style={{margin: 0, flex: 1}}>
            Structural Audit
          </Heading>
        </View>

        <div className="audit-content">
          <div className="audit-props">
            <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Propositions</div>
            {discussions.propositions.map((sentence, i) => (
              <View key={i} style={{display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{
                  fontWeight: 'bold', minWidth: '20px', flexShrink: 0,
                  color: flagged.has(String(i + 1)) ? 'firebrick' : undefined,
                }}>
                  {i + 1}
                </span>
                <span style={{color: '#333'}}>{sentence.content}</span>
              </View>
            ))}
          </div>

          <div className="audit-results">
            {audit.satisfied ? (
              <span style={{color: 'seagreen', fontWeight: 'bold'}}>
                The argument satisfies all structural conditions.
              </span>
            ) : (
              audit.findings.map((finding, i) => <FindingCard key={i} finding={finding} />)
            )}
          </div>
        </div>
      </View>
    </>
  )
}
