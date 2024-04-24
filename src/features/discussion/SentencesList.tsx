import React, {useContext} from 'react'
import {pullAt, concat, sortBy} from 'lodash'
import {useDispatch, useSelector} from 'react-redux'
import {View, Button, Grid} from '@aws-amplify/ui-react'
import {SentenceLine} from './SentenceLine'
import {CurrentUserContext} from '../user/User'
import {selectDiscussions} from './discussionsSlice'
import {focusOnSentence} from './data'

export function SentencesList({section, sentenceListRef}) {
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const sentences = discussions[section]

  function handleNew() {
    dispatch(focusOnSentence(section, sentences.length))
  }

  let elements = sentences.map((sentence, position) => (
    <SentenceLine
      key={sentence.key} section={section} sentence={sentence}
      position={position} sentenceListRef={sentenceListRef}
    />
  ))

  if (section === 'propositions' && discussions.argumentView) {
    const positions = concat([discussions.argumentView.primaryPropositionPosition], discussions.argumentView.secondaryPropositionPositions)
    elements = pullAt(elements, sortBy(positions))
  }
  else if (section === 'arguments' && discussions.argumentView) {
    elements = pullAt(elements, discussions.argumentView.argumentPositions)
  }

  const newButton = !(username && sentences.length !== 0) ? undefined : (
    <View columnSpan={2} style={{placeSelf: 'center start', paddingBottom: '20px'}}>
      <Button variation="link" size="small" onClick={handleNew}>new</Button>
    </View>
  )

  return (
    <Grid
      templateColumns="5rem 20px 1fr 3rem"
      columnGap="5px"
      rowGap="7px"
    >
      {elements}
      {newButton}
    </Grid>
  )
}
