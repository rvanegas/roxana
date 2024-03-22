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
  setShowDetail,
  toggleHideDiscussant,
} from './discussionsSlice'

export function Discussion() {
  const dispatch = useDispatch()
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const discussions = useSelector(selectDiscussions)
  const isSyncing = discussions.eventQueue.length !== 0
  const discussionStatusInit = discussions.status === 'init'
  const discussionId = discussions.discussionId

  function handleNewButton() {
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
      const variables = {id: discussionId}
      const op = graphqlOperation(custom.onDiscussionLayoutById, variables)
      const request = API.graphql(op) as unknown as {subscribe(any)}
      const subscription = request.subscribe({
        next: next => {
          const discussion: GetDiscussionInput = next.value.data.onDiscussionById
          dispatch(getDiscussionAction(discussion))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [dispatch, discussionStatusInit, discussionId, username])

  function handleDetail(e) {
    dispatch(setShowDetail(e.target.checked))
  }
  function handleDiscussantSwitch(e, discussant) {
    e.preventDefault()
    dispatch(toggleHideDiscussant(discussant))
  }

  const discussantButtons = discussions.discussants.map(discussant => {
    const isHidden = discussions.hideDiscussants[discussant]
    return (
      <SwitchField
        style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}
        key={discussant}
        labelPosition="end"
        label={discussant}
        isChecked={!isHidden}
        onClick={e => handleDiscussantSwitch(e, discussant)}
      />
    )
  })

  return (
    <React.Fragment>
      <Heading style={{paddingTop: '30px'}} columnStart="1" columnEnd="-1">
        Discussion: {discussionId}
      </Heading>
      <Button columnSpan={2} variation="link" size="small" onClick={handleNewButton}>new</Button>
      <View columnSpan={2} style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
        <Text style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}>
          {isSyncing && 'syncing...'}
        </Text>
      </View>
      <View columnStart="1" columnEnd="-1">
        <SwitchField
          style={{display: 'inline-block', paddingLeft: '20px', lineHeight: '30px'}}
          labelPosition="end"
          label="detail"
          defaultChecked={true}
          onChange={handleDetail}
        />
        {discussantButtons}
      </View>
      <Grid
        templateColumns="4rem 2rem 1fr 3rem"
        gap="var(--amplify-space-small)"
      >
        <PropositionsList />
        <ArgumentsList />
      </Grid>
    </React.Fragment>
  )
}
