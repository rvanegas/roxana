import React, {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {SentenceLine} from './SentenceLine'
import {CurrentUserContext} from '../user/User'
import {selectDiscussions} from './discussionsSlice'
import {focusOnSentence} from './data'

export function SentencesList({section}) {
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const sentences = discussions[section]

  function handleNew() {
    dispatch(focusOnSentence(section, sentences.length))
  }

  const elements = !sentences ? null : sentences.map((sentence, position) => (
    <SentenceLine key={sentence.key} section={section} sentence={sentence} position={position}
    />
  ))

  const newButton = !(username && sentences.length !== 0) ? undefined : (
    <View columnSpan={2} style={{placeSelf: 'center start', paddingBottom: '20px'}}>
      <Button variation="link" size="small" onClick={handleNew}>new</Button>
    </View>
  )

  return (
    <React.Fragment key={section}>
      <Heading style={{paddingTop: '4px', paddingBottom: '10px'}} columnStart="1" columnEnd="-1">
        {section === 'propositions' ? 'Propositions' : 'Arguments'}
      </Heading>
      {elements}
      {newButton}
    </React.Fragment>
  )
}
