import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import {selectPropositions, selectPropositionsStatus, fetchPropositions} from './propositionsSlice'

export function PropositionsList() {
  const dispatch = useDispatch()
  const propositions = useSelector(selectPropositions)
  const propositionsStatus = useSelector(selectPropositionsStatus)
  const [readOnly] = useState(false)

  useEffect(() => {
    if (propositionsStatus === 'idle') {
      dispatch(fetchPropositions())
    }
  })

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
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
