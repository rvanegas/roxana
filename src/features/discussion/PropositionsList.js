import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as subscriptions from '../../graphql/subscriptions'
import {
  selectPropositions,
  selectPropositionsStatus,
  fetchPropositions,
  updateProposition,
  focusOnPropositionThunk,
  clearPropositionsThunk
} from './propositionsSlice'

export function PropositionsList() {
  const dispatch = useDispatch()
  const propositions = useSelector(selectPropositions)
  const propositionsStatus = useSelector(selectPropositionsStatus)
  const [readOnly] = useState(false)
  const propositionsEmpty = propositions.length === 0

  function handleButton() {
    dispatch(clearPropositionsThunk())
  }

  useEffect(() => {
    if (propositionsStatus === 'idle') {
      console.log('idle')
      dispatch(fetchPropositions())
    } else if (propositionsStatus === 'succeeded' && propositionsEmpty) {
      console.log('succeeded')
      dispatch(focusOnPropositionThunk(0))
    }

    const subscription = API.graphql(graphqlOperation(subscriptions.onUpdateProposition)).subscribe({
      next: next => {
        console.log('next', next)
        dispatch(updateProposition(next.value.data.onUpdateProposition))
      },
      error: error => console.warn(error)
    })

    return function cleanup() {
      subscription.unsubscribe()
    }
  }, [dispatch, propositionsStatus, propositionsEmpty])

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
        <Button onClick={handleButton}>clear</Button>
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
