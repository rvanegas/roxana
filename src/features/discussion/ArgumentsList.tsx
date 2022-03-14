import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {View, Button, Heading} from '@aws-amplify/ui-react'
import {selectDiscussions} from './discussionsSlice'
import {Argument} from './Argument'
import {
  focusOnSentence,
} from './discussionsSlice'

export function ArgumentsList() {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const discussionId = discussions.discussionId
  const arguments_ = discussions.arguments

  function handleNew() {
    dispatch(focusOnSentence('arguments', arguments_.length))
  }

  const argumentElements = !arguments_ ? null : arguments_.map((argument, position) => (
    <Argument position={position} key={argument.key} discussionId={discussionId}
      argument={argument}
    />
  ))

  const newButton = discussions.isCompact ? null : (
    <View columnSpan={2} style={{placeSelf: 'center start'}}>
      <Button variation="link" size="small" onClick={handleNew}>new</Button>
    </View>
  )

  return (
    <React.Fragment key="arguments">
      <Heading style={{paddingTop: '30px'}} columnStart="1" columnEnd="-1">
        Arguments
      </Heading>
      {argumentElements}
      {newButton}
    </React.Fragment>
  )
}
