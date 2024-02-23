import React, {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {API, graphqlOperation} from 'aws-amplify'
import {Grid} from '@aws-amplify/ui-react'
import {PropositionsList} from './PropositionsList'
import {ArgumentsList} from './ArgumentsList'
import * as custom from '../../graphql/custom'
import {
  focusOnNextSentence,
  initializeDiscussion,
  getDiscussionAction,
  selectDiscussions,
} from './discussionsSlice'

const discussionId = 'a1283cfc-61fa-4e4e-a93d-c82cd9d7350a'

export function Discussion() {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const discussionStatus = discussions.status
  const propositionsEmpty = discussions.propositions.length === 0

  useEffect(() => {
    if (discussionStatus === 'init') {
      dispatch(initializeDiscussion({discussionId}))
    } else if (discussionStatus === 'idle' && !propositionsEmpty) {
      if (propositionsEmpty) dispatch(focusOnNextSentence('propositions'))
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
  }, [dispatch, discussionStatus, propositionsEmpty])

  return (
    <Grid
      templateColumns="1rem 2rem 1fr 3rem"
      gap="var(--amplify-space-small)"
    >
      <PropositionsList />
      <ArgumentsList />
    </Grid>
  )
}
