import React, {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, View, Text} from '@aws-amplify/ui-react'
import {Section, Sentence, SentenceMode} from './discussion.d'
import {CurrentUserContext} from '../user/User'
import {
  changeSentenceStatusAction,
  selectDiscussions,
  isActionable
} from './discussionsSlice'

interface SentenceMetaProps {
  sentence: Sentence
  section: Section
  mode: SentenceMode
  editorLine: any
}

export function SentenceMeta({sentence, section, mode, editorLine}: SentenceMetaProps) {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username

  function handleChangeStatus(change) {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change}))
  }

  function claimsSummary() {
    const accepted = sentence.accepted.filter(d => !discussions.hideDiscussants[d])
    const rejected = sentence.rejected.filter(d => !discussions.hideDiscussants[d])
    if (accepted.length > 0 && rejected.length > 0) {
      return [true, false]
    }
    else if (accepted.length > 1) {
      return [true, true]
    }
    else if (rejected.length > 1) {
      return [false, false]
    }
    else if (accepted.length === 1) {
      return [true]
    }
    else if (rejected.length === 1) {
      return [false]
    }
    else {
      return []
    }
  }

  function statusLine() {
    const statusSegments: string[] = []
    statusSegments.push(`status: ${sentence.status}`)
    if (mode) {
      statusSegments.push(`mode: ${mode}`)
    }
    if (sentence.owner) {
      statusSegments.push(`owner: ${sentence.owner}`)
    }
    if (sentence.accepted.length !== 0) {
      const acceptedUsernames = sentence.accepted.join(', ')
      statusSegments.push(`accepted: ${acceptedUsernames}`)
    }
    if (sentence.rejected.length !== 0) {
      const rejectedUsernames = sentence.rejected.join(', ')
      statusSegments.push(`rejected: ${rejectedUsernames}`)
    }
    if (sentence.irrational.length !== 0) {
      const irrationalUsernames = sentence.irrational.join(', ')
      statusSegments.push(`irrational: ${irrationalUsernames}`)
    }
    if (sentence.inArgument) {
      statusSegments.push(`in argument`)
    }
    return statusSegments.join('; ')
  }

  const annotations = claimsSummary().map((claim, index) => (
    <span key={index} style={{color: (claim ? 'seagreen' : 'firebrick')}}>{claim ? '\u2714' : '\u2718'}</span>
  ))
  if (sentence.inArgument) {
    annotations.unshift(<span key="a" style={{color: 'gray'}}>{'\u279c'}</span>)
  }
  const irrational = sentence.irrational.filter(d => !discussions.hideDiscussants[d])
  if (irrational.length !== 0) {
    annotations.push(<span key="i" style={{color: 'red', fontWeight: 'bold'}}>{'\u2049'}</span>)
  }
  const annotationIcons = (
    <View columnStart={1} style={{placeSelf: 'start end'}}>
      {annotations}
    </View>
  )

  const buttons = ['edit', 'commit', 'accept', 'reject', 'clear'].map(action => (
    isActionable[action](sentence, username) &&
      <Button
        key={action} variation="link" size="small"
        style={{paddingBlockStart: '0px', paddingBlockEnd: '0px'}}
        onClick={() => handleChangeStatus(action)}
      >{action}</Button>
  ))

  const actionStatusLine = discussions.isCompact ? null : (
    <View columnSpan={4} style={{placeSelf: 'center start'}}>
      {buttons}
      <Text style={{display: 'inline-block', paddingLeft: '20px', paddingBottom: '20px'}}>
        {statusLine()}
      </Text>
    </View>
  )

  return (
    <React.Fragment>
      {annotationIcons}
      {editorLine}
      {actionStatusLine}
    </React.Fragment>
  )
}
