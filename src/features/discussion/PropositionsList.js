import React from 'react'
import { useSelector } from 'react-redux'
import {
  View, Button
} from '@aws-amplify/ui-react'
import { Proposition } from './Proposition'
import { selectPropositions } from './propositionsSlice'


export function PropositionsList() {
  const propositions = useSelector(selectPropositions)
  const propositionEntities = propositions.map(proposition => (
    <Proposition key={proposition.id} proposition={proposition} />
  ))

  return (
    <View>
      <Button onClick={() => {console.log(propositions)}}>state</Button>
      {propositionEntities}
    </View>
  )
}
