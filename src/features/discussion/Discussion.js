import React, {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {API, graphqlOperation} from 'aws-amplify'
import {Button, Grid} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import * as custom from '../../graphql/custom'
import {
  newDiscussionAction,
  initializeDiscussionAction,
  getDiscussionAction,
  selectDiscussions,
} from './discussionsSlice'

export function Discussion() {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const discussionStatus = discussions.status
  const discussionId = discussions.discussionId

  function handleButton() {
    console.log('newDiscussion')
    dispatch(newDiscussionAction())
  }

  useEffect(() => {
    if (discussionId) {
      if (discussionStatus === 'init') {
        dispatch(initializeDiscussionAction({discussionId}))
      }
      const subscription = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout))
      .subscribe({
        next: next => {
          const {id: discussionId, layout} = next.value.data.onUpdateDiscussion
          dispatch(getDiscussionAction({discussionId, layout}))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatus, discussionId])

  return (
    <Grid
      templateColumns="1rem 2rem 1fr 3rem"
      gap="var(--amplify-space-small)"
    >
      <Button columnSpan={2} onClick={handleButton}>create</Button>
      <PropositionsList />
      <ArgumentsList />
    </Grid>
  )
}
