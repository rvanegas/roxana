import React from 'react'
import {useDispatch} from 'react-redux'
import {Button, View, Text} from '@aws-amplify/ui-react'
import {Section, Sentence, SentenceMode} from './discussion.d'
import {
  changeSentenceStatusAction
} from './discussionsSlice'

interface SentenceMetaProps {
  sentence: Sentence
  section: Section
  mode: SentenceMode
}

export function SentenceMeta({sentence, section, mode}: SentenceMetaProps) {
  const dispatch = useDispatch()

  function handleChangeStatus(change) {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change}))
  }

  let statusLine = `status: ${sentence.status}`
  if (mode) {
    statusLine += `, mode: ${mode}`
  }
  if (sentence.owner) {
    statusLine += `, owner: ${sentence.owner}`
  }

  return (
    <React.Fragment>
      <View columnSpan={2} style={{placeSelf: 'center end'}}>
        <Button variation="link" size="small" onClick={() => handleChangeStatus('edit')}>e</Button>
        <Button variation="link" size="small" onClick={() => handleChangeStatus('commit')}>c</Button>
        <Button variation="link" size="small" onClick={() => handleChangeStatus('accept')}>a</Button>
        <Button variation="link" size="small" onClick={() => handleChangeStatus('reject')}>r</Button>
      </View>
      <View columnSpan={2}>
        <Text alignSelf="center" style={{justifySelf: 'start', lineHeight: '40px'}}>
          {statusLine}
        </Text>
      </View>
    </React.Fragment>
  )
}
