import React, {useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {API, graphqlOperation} from 'aws-amplify'
import {SwitchField, View, Heading, Button, Grid, Text} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import {CurrentUserContext} from '../user/User'
import * as custom from '../../graphql/custom'
import {dlog} from '../../app/util'
import {
  createNewDiscussionAction,
  initializeDiscussionAction,
  GetDiscussionInput,
  getDiscussionAction,
  selectDiscussions,
  setUsername,
  setIsCompact,
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
      if (username === 'rodvandur') {
        dlog.enabled = true
      }
      dispatch(initializeDiscussionAction())
    }
    if (discussionId) {
      const request = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout)) as unknown as {subscribe(any)}
      const subscription = request.subscribe({
        next: next => {
          const discussion: GetDiscussionInput = next.value.data.onUpdateDiscussion
          dispatch(getDiscussionAction(discussion))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatusInit, discussionId, username])

  function handleSwitch(e) {
    dispatch(setIsCompact(e.target.checked))
  }

  function statusLine() {
    const statusSegments: string[] = []
    if (discussionId) {
      statusSegments.push(`current: ${discussionId}`)
    }
    const discussants = discussions.discussants.join(', ')
    if (discussants) {
      statusSegments.push(`discussants: ${discussants}`)
    }
    return statusSegments.join('; ')
  }

  return (
    <React.Fragment>
      <Heading style={{paddingTop: '30px'}} columnStart="1" columnEnd="-1">
        Discussion
      </Heading>
      <Button columnSpan={2} variation="link" size="small" onClick={handleButton}>new</Button>
      <View columnSpan={2} style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
        <SwitchField style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}
          label="hide detail"
          defaultChecked={false}
          onChange={handleSwitch}
        />
        <Text style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
          {isSyncing && 'syncing...'}
        </Text>
      </View>
      <Text columnStart="1" columnEnd="-1" style={{paddingLeft: '10px'}}>
        {statusLine()}
      </Text>
      <Grid
        templateColumns="3rem 2rem 1fr 3rem"
        gap="var(--amplify-space-small)"
      >
        <PropositionsList />
        <ArgumentsList />
      </Grid>
    </React.Fragment>
  )
}
