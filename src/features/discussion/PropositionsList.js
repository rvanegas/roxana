import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Grid, View, SwitchField} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import {selectPropositions} from './propositionsSlice'

export function PropositionsList() {
  const propositions = useSelector(selectPropositions)
  const [readOnly, setReadOnly] = useState(false)

  function handleChange(e) {
    setReadOnly(e.target.checked)
  }

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
      <View as="header" columnSpan={2}>
        <SwitchField label="Read Only" defaultChecked={readOnly} onChange={handleChange} />
      </View>
      {propositionEntities}
    </Grid>
  )
}
