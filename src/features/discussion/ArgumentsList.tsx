import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Heading} from '@aws-amplify/ui-react'
import {selectDiscussions} from './discussionsSlice'
import {Argument} from './Argument'

export function ArgumentsList() {
  const [readOnly] = useState(false)
  const discussions = useSelector(selectDiscussions)
  const discussionId = discussions.discussionId
  const arguments_ = discussions.arguments

  const argumentElements = !arguments_ ? null : arguments_.map((argument, position) => (
    <Argument position={position} key={argument.key} discussionId={discussionId}
      argument={argument} readOnly={readOnly}
    />
  ))

  return (
    <React.Fragment key="arguments">
      <Heading style={{paddingTop: '20px'}} columnStart="1" columnEnd="-1">
        Arguments
      </Heading>
      {argumentElements}
    </React.Fragment>
  )
}
