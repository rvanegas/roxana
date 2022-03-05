import React from 'react'
// import React, {useContext} from 'react'
import {useSelector} from 'react-redux'
import {Text, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
// import {CurrentUserContext} from '../user/User'
import '@aws-amplify/ui-react/styles.css'
import {
  selectDiscussions,
  propositionIdsFromArgument,
} from './discussionsSlice'

export function PropositionsList() {
  // const currentUser = useContext(CurrentUserContext)
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  const arguments_ = discussions.arguments || []
  // can be memoized
  const propositionIds = arguments_.map(a => propositionIdsFromArgument(a)).flat()
  function isReadOnly(proposition) {
    return propositionIds.some(id => id === proposition.id)
  }

  // console.log('username', currentUser.username)

  const propositionEntities = !propositions ? null : propositions.map((proposition, position) => (
    <Proposition key={proposition.key} position={position} discussionId={discussions.discussionId}
      proposition={proposition} readOnly={isReadOnly(proposition)}
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
