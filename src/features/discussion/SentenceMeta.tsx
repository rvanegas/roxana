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
import {claimsSummary} from './discussionUtil'

interface SentenceMetaProps {
  sentence: Sentence
  section: Section
  mode: SentenceMode
}

export function SentenceMeta({sentence, section, mode}: SentenceMetaProps) {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username

  function handleChangeStatus(change) {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change}))
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

  function annotations() {
    const icons = claimsSummary(sentence, discussions.discussants).map((claim, index) => (
      <span key={index} style={{color: (claim ? 'seagreen' : 'firebrick')}}>{claim ? '\u2714' : '\u2718'}</span>
    ))
    if (sentence.irrational.length !== 0) {
      icons.push(<span key="i" style={{color: 'red', fontWeight: 'bold'}}>{'\u2049'}</span>)
    }
    return icons
  }

  const actionStatusLine = discussions.isCompact ? null : (
    <View columnSpan={4} style={{placeSelf: 'center start'}}>
      <Button variation="link" size="small" isDisabled={!isActionable.edit(sentence)} onClick={() => handleChangeStatus('edit')}>edit</Button>
      <Button variation="link" size="small" isDisabled={!isActionable.commit(sentence, username)} onClick={() => handleChangeStatus('commit')}>commit</Button>
      <Button variation="link" size="small" isDisabled={!isActionable.accept(sentence, username)} onClick={() => handleChangeStatus('accept')}>accept</Button>
      <Button variation="link" size="small" isDisabled={!isActionable.reject(sentence, username)} onClick={() => handleChangeStatus('reject')}>reject</Button>
      <Button variation="link" size="small" isDisabled={!isActionable.clear(sentence, username)} onClick={() => handleChangeStatus('clear')}>clear</Button>
      <Text style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '40px'}}>
        {statusLine()}
      </Text>
    </View>
  )
  const annotationIcons = (
    <View columnStart={1} style={{placeSelf: 'start end'}}>
      {annotations()}
    </View>
  )

  return (
    <React.Fragment>
      {actionStatusLine}
      {annotationIcons}
    </React.Fragment>
  )
}
