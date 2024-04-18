import React, {useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import {API, graphqlOperation} from 'aws-amplify'
import {SwitchField, View, Grid} from '@aws-amplify/ui-react'
import {SentencesList} from './SentencesList'
import {CurrentUserContext} from '../user/User'
import * as custom from '../../graphql/custom'
import {dlog} from '../../app/util'
import {selectDiscussions, discussionsSlice} from './discussionsSlice'
import {getDiscussionAction, initializeDiscussionAction} from './data'

export function Discussion() {
  const dispatch = useDispatch()
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const params = useParams()
  const discussions = useSelector(selectDiscussions)
  const discussionStatusInit = discussions.status === 'init'
  const usernameChanged = discussions.username !== username
  const discussionId = discussions.discussionId
  const {setUsername, toggleHideDiscussant, toggleShowHidden} = discussionsSlice.actions

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
          const discussion = next.value.data.onDiscussionById
          dispatch(getDiscussionAction(discussion))
        },
        error: error => console.error(error),
      })
      return () => subscription.unsubscribe()
    }
  }, [
    setUsername, dispatch, discussionStatusInit, usernameChanged, discussionId,
    username, params
  ])

  function handleDiscussantSwitch(e, discussant) {
    e.preventDefault()
    dispatch(toggleHideDiscussant(discussant))
  }

  function handleHiddenSwitch(e) {
    e.preventDefault()
    dispatch(toggleShowHidden())
  }

  const anyHidden = discussions.propositions.concat(discussions.arguments).some(s => s.hidden)

  const hiddenToggle = !anyHidden ? undefined : (
    <SwitchField
      trackCheckedColor="blue"
      style={{display: 'inline-block', lineHeight: '30px'}}
      key="-hidden" labelPosition="end" label="show hidden" isChecked={!discussions.showHidden}
      onClick={e => handleHiddenSwitch(e)}
    />
  )

  const discussantToggles = discussions.discussants.map(discussant => {
    const isHidden = discussions.hideDiscussants[discussant]
    return (
      <SwitchField
        style={{display: 'inline-block', lineHeight: '30px'}}
        key={discussant} labelPosition="end" label={discussant} isChecked={!isHidden}
        onClick={e => handleDiscussantSwitch(e, discussant)}
      />
    )
  })

  const argumentsList = discussions.arguments.length === 0 ? null : <SentencesList section="arguments" />

  return (
    <React.Fragment>
      <View columnStart="1" columnEnd="-1">
        {hiddenToggle}
        {discussantToggles}
      </View>
      <Grid
        templateColumns="5rem 20px 1fr 3rem"
        columnGap="5px"
      >
        <SentencesList section="propositions" />
        {argumentsList}
      </Grid>
    </React.Fragment>
  )
}
