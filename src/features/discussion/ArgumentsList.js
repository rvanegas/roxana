import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Grid, View, Button} from '@aws-amplify/ui-react'
import {selectArguments} from './argumentsSlice'
import {Argument} from './Argument'

export function ArgumentsList() {
  const [readOnly, setReadOnly] = useState(false)
  const arguments_ = useSelector(selectArguments)

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
        <Button onClick={() => console.log(arguments_)}>state</Button>
        <Button onClick={() => setReadOnly(!readOnly)}>edit</Button>
        {"  "}{readOnly ? 'readOnly' : ''}
      </View>
      {argumentElements}
    </Grid>
  )
}
