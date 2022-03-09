import React from 'react'
import {useSelector} from 'react-redux'
import {Text, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import '@aws-amplify/ui-react/styles.css'
import {
  selectDiscussions,
} from './discussionsSlice'

export function PropositionsList() {
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions

  const propositionEntities = !propositions ? null : propositions.map((proposition, position) => (
    <Proposition key={proposition.key} position={position} discussionId={discussions.discussionId}
      proposition={proposition}
    />
  ))

  return (
    <React.Fragment key="propositions">
      <Heading style={{paddingTop: '20px'}} columnStart="1" columnEnd="-1">
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
