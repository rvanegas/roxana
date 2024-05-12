import React, {useEffect, useRef, MutableRefObject} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import {API, graphqlOperation} from 'aws-amplify'
import {SwitchField, Heading, Button, View, Grid} from '@aws-amplify/ui-react'
import {SentencesList} from './SentencesList'
import * as custom from '../../graphql/custom'
import {selectDiscussions, discussionsSlice} from './discussionsSlice'
import {getDiscussionAction, initializeDiscussionAction,
  createInviteCodeAction, revokeInviteCodeAction} from './data'

export function Discussion() {
  const dispatch = useDispatch()
  const params = useParams()
  const propositionsListRef = useRef() as MutableRefObject<HTMLElement>
  const argumentsListRef = useRef() as MutableRefObject<HTMLElement>
  const discussions = useSelector(selectDiscussions)
  const discussionId = discussions.discussionId
  const {toggleHideDiscussant, toggleShowHidden} = discussionsSlice.actions
  const inviteLink = `${window.location.protocol}//${window.location.host}/invite/${discussions.inviteCode}`

  useEffect(() => {
    if (discussions.username && params.discussionId && discussionId !== params.discussionId) {
      dispatch(initializeDiscussionAction({discussionId: params.discussionId}))
    }
  }, [dispatch, params.discussionId, discussionId, discussions.username])

  useEffect(() => {
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
  }, [dispatch, discussionId])

  function handleDiscussantSwitch(e, discussant) {
    e.preventDefault()
    dispatch(toggleHideDiscussant(discussant))
  }

  function handleHiddenSwitch(e) {
    e.preventDefault()
    dispatch(toggleShowHidden())
  }

  function handleCreateInviteLink() {
    dispatch(createInviteCodeAction())
  }

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(inviteLink).then(() => console.log('copied'))
  }

  function handleRevokeInviteLink() {
    dispatch(revokeInviteCodeAction())
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

  const privateWithInviteButton = (
    <View>
      <Button variation="link" size="small" onClick={handleCreateInviteLink}>create invite link</Button>
    </View>
  )
  const privateWithRevokeButton = (
    <View>
      <Button variation="link" size="small" onClick={handleCopyInviteLink}>copy invite link</Button>
      <Button style={{marginLeft: '10px'}} variation="link" size="small" onClick={handleRevokeInviteLink}>revoke invite link</Button>
    </View>
  )

  return (
    <View>
      {!discussions.isPrivate ? null : discussions.inviteCode ? privateWithRevokeButton : privateWithInviteButton}
      <View className="view-toggles" columnStart="1" columnEnd="-1">
        {hiddenToggle}
        {discussantToggles}
      </View>
      <Grid templateColumns="1fr 1fr">
        <Heading className="sentence-list-header sentence-list-header-adjacent">
          Propositions
        </Heading>
        <Heading className="sentence-list-header sentence-list-header-adjacent">
          Arguments
        </Heading>
      </Grid>
      <View className="discussion-container">
        <View ref={propositionsListRef} className="sentence-list" style={{left: 0}}>
          <Heading className="sentence-list-header sentence-list-header-stacked">
            Propositions
          </Heading>
          <SentencesList section="propositions" sentenceListRef={propositionsListRef} />
        </View>
        <View ref={argumentsListRef} className="sentence-list" style={{right: 0}}>
          <Heading className="sentence-list-header sentence-list-header-stacked">
            Arguments
          </Heading>
          <SentencesList section="arguments" sentenceListRef={argumentsListRef} />
        </View>
      </View>
    </View>
  )
}
