import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Grid, View} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import {selectPropositions} from './propositionsSlice'

export function PropositionsList() {
  const propositions = useSelector(selectPropositions)
  const [readOnly] = useState(false)

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.id}>
      <View columnSpan={1}>
        {proposition.index}
      </View>
      <View columnSpan={1}>
        <Proposition proposition={proposition} readOnly={readOnly} />
      </View>
    </React.Fragment>
  ))

  return (
    <Grid
      templateColumns="2rem 1fr"
      gap="var(--amplify-space-small)"
    >
      <View colSpan="auto">
        Propositions
      </View>
      {propositionEntities}
    </Grid>
  )
}
