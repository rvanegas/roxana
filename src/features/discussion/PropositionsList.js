import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import {
  selectDiscussions,
} from './discussionsSlice'

export function PropositionsList() {
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  const [readOnly] = useState(false)

  function handleButton() {
    console.log('button')
  }

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.key}>
      <View columnStart={2}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Proposition discussionId={discussions.discussionId} proposition={proposition} readOnly={readOnly} />
      </View>
    </React.Fragment>
  ))

  return (
    <React.Fragment key="propositions">
      <Heading style={{paddingTop: '20px'}} columnStart="1" columnEnd="-1">
        <Button onClick={handleButton}>get</Button>
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
