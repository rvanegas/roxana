import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {View, TextField} from '@aws-amplify/ui-react'
import {selectPropositions} from './propositionsSlice'

export function Argument({argument}) {
  const [argumentCode, setArgumentCode] = useState('')
  const propositions = useSelector(selectPropositions)
  const propositionById = id => propositions.find(proposition => proposition.id === id)

  const premiseElements = argument.premiseIds.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.id}>
        <View columnStart={2}>{premise.index}</View>
        <View>{premise.content}</View>
      </React.Fragment>
    )
  })
  const conclusion = propositionById(argument.conclusionId)
  const conclusionElement = (
    <React.Fragment key={conclusion.id}>
      <View style={{'justify-self': 'end'}}>:.</View>
      <View>{conclusion.index}</View>
      <View>{conclusion.content}</View>
    </React.Fragment>
  )
  return (
    <React.Fragment key={argument.id}>
      <View columnStart={2} columnEnd={-1}>
        <TextField
          direction="row" alignItems="baseline"
          label={argument.index} value={argumentCode}
          onChange={(e) => setArgumentCode(e.target.value)}
        />
      </View>
      {premiseElements}
      {conclusionElement}
    </React.Fragment>
  )
}
