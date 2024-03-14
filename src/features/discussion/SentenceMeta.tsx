import React, {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, View, Text} from '@aws-amplify/ui-react'
import {Section, Sentence, SentenceMode} from './discussion.d'
import {CurrentUserContext} from '../user/User'
import {
  changeSentenceStatusAction,
  selectDiscussions,
  isEditable,
  isCommittable,
  isAcceptable,
  isRejectable
} from './discussionsSlice'

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

  if (discussions.isCompact) {
    return null
  }

  function handleChangeStatus(change) {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change}))
  }

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
  if (sentence.inArgument) {
    statusSegments.push(`in argument`)
  }
  const statusLine = statusSegments.join(', ')

  return (
    <React.Fragment>
      <View columnSpan={4} style={{placeSelf: 'center start'}}>
        <Button variation="link" size="small" isDisabled={!isEditable(sentence)} onClick={() => handleChangeStatus('edit')}>edit</Button>
        <Button variation="link" size="small" isDisabled={!isCommittable(sentence, username)} onClick={() => handleChangeStatus('commit')}>commit</Button>
        <Button variation="link" size="small" isDisabled={!isAcceptable(sentence)} onClick={() => handleChangeStatus('accept')}>accept</Button>
        <Button variation="link" size="small" isDisabled={!isRejectable(sentence)} onClick={() => handleChangeStatus('reject')}>reject</Button>
        <Text style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '40px'}}>
          {statusLine}
        </Text>
      </View>
    </React.Fragment>
  )
}
