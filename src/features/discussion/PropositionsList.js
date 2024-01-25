import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  View, Button, Divider
} from '@aws-amplify/ui-react'
import { Proposition } from './Proposition'
import { selectPropositions } from './propositionsSlice'


export function PropositionsList() {
  const propositions = useSelector(selectPropositions)
  const [readOnly, setReadOnly] = useState(false)

  const propositionEntities = propositions.map(proposition => (
    <Proposition key={proposition.id} proposition={proposition} readOnly={readOnly} />
  ))

  return (
    <View>
      <Button onClick={() => {console.log(propositions)}}>state</Button>
      <Button onClick={() => setReadOnly(!readOnly)}>edit</Button>
      <Divider/>
      [{readOnly ? '1' : '0'}]
      <Divider/>
      {propositionEntities}
    </View>
  )
}
