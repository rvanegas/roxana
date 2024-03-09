import React, {useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {API, graphqlOperation} from 'aws-amplify'
import {Button, Grid, Text} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import {CurrentUserContext} from '../user/User'
import * as custom from '../../graphql/custom'

import {
  createNewDiscussionAction,
  initializeDiscussionAction,
  getDiscussionAction,
  selectDiscussions,
  setUsername,
} from './discussionsSlice'

export function Discussion() {
  const dispatch = useDispatch()
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const discussions = useSelector(selectDiscussions)
  const isSyncing = discussions.eventQueue.length !== 0
  const discussionStatusInit = discussions.status === 'init'
  const discussionId = discussions.discussionId

  function handleButton() {
    dispatch(createNewDiscussionAction())
  }

  useEffect(() => {
    if (discussionStatusInit) {
      dispatch(setUsername(username))
      dispatch(initializeDiscussionAction({discussionId}))
    }
    if (discussionId) {
      const request = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout)) as unknown as {subscribe(any)}
      const subscription = request.subscribe({
        next: next => {
          const {id: discussionId, layout, version} = next.value.data.onUpdateDiscussion
          dispatch(getDiscussionAction({discussionId, layout, version}))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatusInit, discussionId, username])

  return (
    <Grid
      templateColumns="2rem 2rem 1fr 3rem"
      gap="var(--amplify-space-small)"
    >
      <Button columnSpan={2} onClick={handleButton}>new</Button>
      <Text alignSelf="center" style={{justifySelf: 'start'}}>
        {isSyncing && 'syncing...'}
      </Text>
      <PropositionsList />
      <ArgumentsList />
    </Grid>
  )
}
