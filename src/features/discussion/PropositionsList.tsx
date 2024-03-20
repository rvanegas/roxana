import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Heading, View, Button} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import '@aws-amplify/ui-react/styles.css'
import {
  selectDiscussions,
  focusOnSentence,
} from './discussionsSlice'

export function PropositionsList() {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions

  function handleNew() {
    dispatch(focusOnSentence('propositions', propositions.length))
  }

  const propositionEntities = !propositions ? null : propositions.map((proposition, position) => (
    <Proposition key={proposition.key} position={position} discussionId={discussions.discussionId}
      proposition={proposition}
    />
  ))

  const newButton = discussions.isCompact ? null : (
    <View columnSpan={2} style={{placeSelf: 'center start'}}>
      <Button variation="link" size="small" onClick={handleNew}>new</Button>
    </View>
  )

  return (
    <React.Fragment key="propositions">
      <Heading style={{paddingTop: '30px', paddingBottom: '10px'}} columnStart="1" columnEnd="-1">
        Propositions
      </Heading>
      {propositionEntities}
      {newButton}
    </React.Fragment>
  )
}
