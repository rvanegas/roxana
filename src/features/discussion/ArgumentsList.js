import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Grid, View, Button, TextField} from '@aws-amplify/ui-react'
import {selectArguments} from './argumentsSlice'
import {selectPropositions} from './propositionsSlice'

export function ArgumentsList() {
  const [readOnly, setReadOnly] = useState(false)
  const arguments_ = useSelector(selectArguments)
  const propositions = useSelector(selectPropositions)
  if (!arguments_) {
    return null;
  }

  const argumentElements = arguments_.map(argument => {
    const premiseElements = argument.premiseIds.map(premiseId => {
      const premise = propositions.find(proposition => proposition.id === premiseId)
      return (
        <React.Fragment key={premise.id}>
          <View columnStart={2}>{premise.index}</View>
          <View>{premise.content}</View>
        </React.Fragment>
      )
    })
    const conclusion = propositions.find(proposition => proposition.id === argument.conclusionId)
    const conclusionElement = (
      <React.Fragment key={conclusion.id}>
        <View>:.</View>
        <View>{conclusion.index}</View>
        <View>{conclusion.content}</View>
      </React.Fragment>
    )
    return (
      <React.Fragment key={argument.id}>
        <View columnSpan={3}><TextField direction="row" alignItems="baseline" label={argument.index} columnSpan={3} placeholder="12 : 24"/></View>
        {premiseElements}
        {conclusionElement}
      </React.Fragment>
    )
  })
  return (
    <Grid
      templateColumns="2rem 2rem 1fr"
      gap="var(--amplify-space-small)"
    >
      <View as="header" columnSpan={3}>
        <Button onClick={() => console.log(arguments_)}>state</Button>
        <Button onClick={() => setReadOnly(!readOnly)}>edit</Button>
        {"  "}{readOnly ? 'readOnly' : ''}
      </View>
      {argumentElements}
    </Grid>
  )
}
