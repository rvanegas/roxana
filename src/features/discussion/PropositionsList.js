import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as custom from '../../graphql/custom'
import {
  selectDiscussions,
  focusOnNextSentence,
  getDiscussionAction,
} from './discussionsSlice'

export function PropositionsList({discussionId}) {
  const dispatch = useDispatch()
  const discussion = useSelector(selectDiscussions)
  const propositions = discussion.propositions
  const discussionStatus = discussion.status
  const [readOnly] = useState(false)
  const propositionsEmpty = propositions.length === 0

  function handleButton() {
    console.log('button')
  }

  useEffect(() => {
    if (discussionStatus === 'init') {
      dispatch(getDiscussionAction({discussionId}))
    } else if (discussionStatus === 'idle' && propositionsEmpty) {
      dispatch(focusOnNextSentence('propositions'))
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
  }, [dispatch, discussionId, discussionStatus, propositionsEmpty])

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.key}>
      <View columnStart={2}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Proposition discussionId={discussionId} proposition={proposition} readOnly={readOnly} />
      </View>
    </React.Fragment>
  ))

  return (
    <React.Fragment key="propositions">
      <Heading style={{paddingTop: '20px'}} columnStart="1" columnEnd="-1">
        <Button onClick={handleButton}>get</Button>
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
