import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as custom from '../../graphql/custom'
import * as subscriptions from '../../graphql/subscriptions'
import {
  focusOnPropositionThunk,
  clearPropositionsThunk
} from './propositionsSlice'
import {
  selectDiscussion,
  getDiscussion,
  focusOnProposition,
  getDiscussionAction,
  getDiscussionUpdate,
  consoleHandlerAction
} from './discussionsSlice'

const discussionId = 'b4d10035-d214-4c49-a9b1-862384d2b96e'

export function PropositionsList() {
  const dispatch = useDispatch()
  const discussion = useSelector(selectDiscussion)
  const propositions = discussion.propositions
  const discussionStatus = discussion.status
  const [readOnly] = useState(false)
  const propositionsEmpty = propositions.length === 0

  function handleButton() {
    console.log('button')
  }

  useEffect(() => {
    if (discussionStatus === 'init') {
      console.log('init')
      dispatch(getDiscussionAction(discussionId))
      // dispatch(consoleHandlerAction('bar1'))
      // dispatch(consoleHandlerAction('bar2'))
      // dispatch(consoleHandlerAction('bar3'))
      // dispatch(consoleHandlerAction('bar4'))
    } else if (discussionStatus === 'idle' && propositionsEmpty) {
      dispatch(focusOnProposition(0))
      console.log('succeeded')
    }

    const subscription = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout))
    .subscribe({
      next: next => {
        console.log('next', next)
        dispatch(getDiscussionUpdate(next.value.data.onUpdateDiscussion))
      },
      error: error => console.error(error)
    })

    return function cleanup() {
      subscription.unsubscribe()
    }
  }, [dispatch, discussionStatus, propositionsEmpty])

  const propositionEntities = propositions.map(proposition => (
    <React.Fragment key={proposition.nanoid ? proposition.nanoid : proposition.id}>
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
