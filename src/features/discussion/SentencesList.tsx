import React, {useContext} from 'react'
import {pullAt, concat} from 'lodash'
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
    const primaryProposition = elements[discussions.argumentView.primaryPropositionPosition]
    const secondaryPropositions = elements.filter((element, position) =>
      discussions.argumentView.secondaryPropositionPositions.includes(position)
    )
    const indexes = concat([discussions.argumentView.primaryPropositionPosition], discussions.argumentView.secondaryPropositionPositions)
    pullAt(elements, indexes)
    elements = concat([], primaryProposition, secondaryPropositions)
  }
  else if (section === 'arguments' && discussions.argumentView) {
    const argumentPositions = pullAt(elements, discussions.argumentView.argumentPositions)
    elements = concat([], argumentPositions)
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
