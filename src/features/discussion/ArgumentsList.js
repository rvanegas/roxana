import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Grid, View, SwitchField} from '@aws-amplify/ui-react'
import {selectArguments} from './argumentsSlice'
import {Argument} from './Argument'

export function ArgumentsList() {
  const [readOnly, setReadOnly] = useState(false)
  const arguments_ = useSelector(selectArguments)

  function handleChange(e) {
    setReadOnly(e.target.checked)
  }

  if (!arguments_) {
    return null;
  }

  const argumentElements = arguments_.map(argument => (
    <Argument key={argument.id} argument={argument} readOnly={readOnly} />
  ))

  return (
    <Grid
      templateColumns="1rem 2rem 1fr"
      gap="var(--amplify-space-small)"
    >
      <View as="header" columnStart={2} columnEnd={-1}>
        <SwitchField label="Read Only" defaultChecked={readOnly} onChange={handleChange} />
      </View>
      {argumentElements}
    </Grid>
  )
}
