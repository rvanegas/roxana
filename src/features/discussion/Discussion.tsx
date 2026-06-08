import React, {useState, useEffect, useRef, useContext, MutableRefObject} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import { generateClient } from 'aws-amplify/api'
import {SwitchField, Heading, Button, View, Grid} from '@aws-amplify/ui-react'
import {SentencesList} from './SentencesList'
import {DianoiaView} from './DianoiaView'
import {useDianoia} from './DianoiaContext'
import {dlog} from '../../app/util'
import * as custom from '../../graphql/custom'
import {CurrentUserContext} from '../user/User'
import {selectDiscussions, discussionsSlice} from './discussionsSlice'
import {getDiscussionAction, initializeDiscussionAction,
  createInviteCodeAction, revokeInviteCodeAction} from './data'
import {AppDispatch} from '../../app/store'

let _client: ReturnType<typeof generateClient> | null = null
const client = () => { if (!_client) _client = generateClient({ authMode: 'apiKey' }); return _client }

export function Discussion() {
  const dispatch = useDispatch<AppDispatch>()
  const params = useParams()
  const {viewOpen} = useDianoia()
  const propositionsListRef = useRef() as MutableRefObject<HTMLDivElement>
  const argumentsListRef = useRef() as MutableRefObject<HTMLDivElement>
  const {route} = useContext(CurrentUserContext) as unknown as {user, route}
  const discussions = useSelector(selectDiscussions)
  const username = discussions.username
  const discussionId = discussions.discussionId
  const {toggleHideDiscussant, toggleShowHidden} = discussionsSlice.actions
  const inviteLink = `${window.location.protocol}//${window.location.host}/invite/${discussions.inviteCode}`
  const [refreshSubscription, setRefreshSubscription] = useState(false)

  useEffect(() => {
    if (params.discussionId && discussionId !== params.discussionId) {
      dispatch(initializeDiscussionAction({discussionId: params.discussionId}))
    }
  }, [dispatch, params.discussionId, discussionId])

  useEffect(() => {
    if (discussionId) {
      dlog('subscribe')
      const subscription = (client().graphql({
        query: custom.onDiscussionLayoutById,
        variables: { id: discussionId },
      }) as any).subscribe({
        next: ({ data }: any) => {
          const discussion = data.onDiscussionById
          dlog('subscribed update', discussion.revision)
          dispatch(getDiscussionAction(discussion))
        },
        error: (error: any) => {
          dlog('subscription error', error)
          setRefreshSubscription(r => !r)
        },
      })
      return () => {
        dlog('unsubscribe')
        subscription.unsubscribe()
      }
    }
  }, [dispatch, discussionId, refreshSubscription])

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
    <View style={{height: '100%', display: 'flex', flexDirection: 'column', position: 'relative'}}>
      {viewOpen && <DianoiaView />}
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
      <View className="discussion-container" style={{flex: 1, minHeight: 0}}>
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
