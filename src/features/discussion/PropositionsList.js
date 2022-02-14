import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as subscriptions from '../../graphql/subscriptions'
import {
  focusOnPropositionThunk,
  clearPropositionsThunk
} from './propositionsSlice'
import {
  selectDiscussion,
  getDiscussion
} from './discussionsSlice'

const discussionId = 'd172f9ff-8e5b-4229-b803-aee6dc8855a2'

export function PropositionsList() {
  const dispatch = useDispatch()
  const discussion = useSelector(selectDiscussion)
  const propositions = discussion.propositions
  const discussionStatus = discussion.status
  const [readOnly] = useState(false)
  const propositionsEmpty = propositions.length === 0

  function handleButton() {
    dispatch(getDiscussion(discussionId))
  }

  useEffect(() => {
    if (discussionStatus === 'idle') {
      console.log('idle')
      dispatch(getDiscussion(discussionId))
    } else if (discussionStatus === 'succeeded' && propositionsEmpty) {
      console.log('succeeded')
      // dispatch(focusOnPropositionThunk(0))
    }

    const subscription = API.graphql(graphqlOperation(subscriptions.onUpdateDiscussion)).subscribe({
      next: next => {
        console.log('next', next)
        dispatch(getDiscussion(next.value.data.onUpdateDiscussion.id))
      },
      error: error => console.error(error)
    })

    return function cleanup() {
      subscription.unsubscribe()
    }
  }, [dispatch, discussionStatus, propositionsEmpty])

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.id}>
      <View columnStart={2}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Proposition proposition={proposition} readOnly={readOnly} />
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
