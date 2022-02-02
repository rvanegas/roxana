import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import {selectPropositions, loadPropositions} from './propositionsSlice'

export function PropositionsList() {
  const propositions = useSelector(selectPropositions)
  const [readOnly] = useState(false)

  function showMe() {
    loadPropositions()
  }

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.id}>
      <View columnStart={2}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Proposition proposition={proposition} readOnly={readOnly} />
      </View>
    </React.Fragment>
  ))

  return (
    <React.Fragment key="propositions">
      <Heading style={{paddingTop: '20px'}} columnStart="1" columnEnd="-1">
        <Button onClick={showMe}>showMe</Button>
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
