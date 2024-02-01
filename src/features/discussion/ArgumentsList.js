import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Heading} from '@aws-amplify/ui-react'
import {selectArguments} from './argumentsSlice'
import {Argument} from './Argument'

export function ArgumentsList() {
  const [readOnly] = useState(false)
  const arguments_ = useSelector(selectArguments)

  if (!arguments_) {
    return null;
  }

  const argumentElements = arguments_.map(argument => (
    <Argument key={argument.id} argument={argument} readOnly={readOnly} />
  ))

  return (
    <React.Fragment key="arguments">
      <Heading columnStart="1" columnEnd="-1">
        Arguments
      </Heading>
      {argumentElements}
    </React.Fragment>
  )
}
