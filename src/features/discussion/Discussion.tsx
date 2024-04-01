import React, {useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import {API, graphqlOperation} from 'aws-amplify'
import {SwitchField, View, Heading, Grid, Text} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import {CurrentUserContext} from '../user/User'
import * as custom from '../../graphql/custom'
import {dlog} from '../../app/util'
import {
  initializeDiscussionAction,
  GetDiscussionUpdateInput,
  getDiscussionAction,
  selectDiscussions,
  setUsername,
  toggleHideDiscussant,
} from './discussionsSlice'

export function Discussion() {
  const dispatch = useDispatch()
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const params = useParams()
  const discussions = useSelector(selectDiscussions)
  const isSyncing = discussions.eventQueue.length !== 0
  const discussionStatusInit = discussions.status === 'init'
  const usernameChanged = discussions.username !== username
  const discussionId = discussions.discussionId

  useEffect(() => {
    if (usernameChanged) {
      dispatch(setUsername(username))
      if (username === 'rodvandur') {
        dlog.enabled = true
      }
    }

    if (discussionStatusInit || (discussionId && discussionId !== params.discussionId)) {
      dispatch(initializeDiscussionAction({discussionId: params.discussionId}))
    }

    if (discussionId) {
      const variables = {id: discussionId}
      const op = graphqlOperation(custom.onDiscussionLayoutById, variables)
      const request = API.graphql(op) as unknown as {subscribe(any)}
      const subscription = request.subscribe({
        next: next => {
          const discussion: GetDiscussionUpdateInput = next.value.data.onDiscussionById
          dispatch(getDiscussionAction(discussion))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatusInit, usernameChanged, discussionId, username, params])

  function handleDiscussantSwitch(e, discussant) {
    e.preventDefault()
    dispatch(toggleHideDiscussant(discussant))
  }

  const discussantButtons = discussions.discussants.map(discussant => {
    const isHidden = discussions.hideDiscussants[discussant]
    return (
      <SwitchField
        style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}
        key={discussant} labelPosition="end" label={discussant} isChecked={!isHidden}
        onClick={e => handleDiscussantSwitch(e, discussant)}
      />
    )
  })

  const argumentsList = discussions.arguments.length === 0 ? null : <ArgumentsList />

  return (
    <React.Fragment>
      <Heading style={{paddingTop: '30px'}} columnStart="1" columnEnd="-1">
        Discussion: {discussionId}
      </Heading>
      <View columnEnd={-1} style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
        <Text style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
          {isSyncing && 'syncing...'}
        </Text>
      </View>
      <View columnStart="1" columnEnd="-1">
        {discussantButtons}
      </View>
      <Grid
        templateColumns="4rem 2rem 1fr 3rem"
        gap="var(--amplify-space-xs)"
      >
        <PropositionsList />
        {argumentsList}
      </Grid>
    </React.Fragment>
  )
}
