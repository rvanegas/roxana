import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as custom from '../../graphql/custom'
import {
  selectDiscussion,
  focusOnProposition,
  getDiscussionAction,
} from './discussionsSlice'

const discussionId = '0a345806-bd06-422f-8c0e-b593409b660e'

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
      dispatch(getDiscussionAction({id: discussionId}))
    } else if (discussionStatus === 'idle' && propositionsEmpty) {
      dispatch(focusOnProposition(0))
    }
    const subscription = API.graphql(graphqlOperation(custom.onUpdateDiscussionLayout))
    .subscribe({
      next: next => dispatch(getDiscussionAction(next.value.data.onUpdateDiscussion)),
      error: error => console.error(error),
    })
    return () => subscription.unsubscribe()
  }, [dispatch, discussionStatus, propositionsEmpty])

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
