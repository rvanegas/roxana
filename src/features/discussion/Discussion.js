import React, {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {API, graphqlOperation} from 'aws-amplify'
import {Button, Grid, Text} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import * as custom from '../../graphql/custom'

import {
  createNewDiscussionAction,
  initializeDiscussionAction,
  getDiscussionAction,
  selectDiscussions,
} from './discussionsSlice'

export function Discussion() {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const isSyncing = discussions.eventQueue.length !== 0
  const discussionStatusInit = discussions.status === 'init'
  const discussionId = discussions.discussionId

  function handleButton() {
    dispatch(createNewDiscussionAction())
  }

  useEffect(() => {
    if (discussionStatusInit) {
      dispatch(initializeDiscussionAction({discussionId}))
    }
    if (discussionId) {
      const subscription = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout)).subscribe({
        next: next => {
          const {id: discussionId, layout, version} = next.value.data.onUpdateDiscussion
          dispatch(getDiscussionAction({discussionId, layout, version}))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatusInit, discussionId])

  return (
    <Grid
      templateColumns="1rem 2rem 1fr 3rem"
      gap="var(--amplify-space-small)"
    >
      <Button columnSpan={2} onClick={handleButton}>New</Button>
      <Text alignSelf="center" style={{justifySelf: 'start'}}>
        {isSyncing && 'syncing...'}
      </Text>
      <PropositionsList />
      <ArgumentsList />
    </Grid>
  )
}
