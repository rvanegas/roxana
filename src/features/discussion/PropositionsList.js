import {API, graphqlOperation} from 'aws-amplify'
import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Text, Button, View, Heading} from '@aws-amplify/ui-react'
import {Proposition} from './Proposition'
import * as subscriptions from '../../graphql/subscriptions'
import {
  selectPropositions, selectPropositionsStatus,
  fetchPropositions,
  createProposition, updateProposition
} from './propositionsSlice'

export function PropositionsList() {
  const dispatch = useDispatch()
  const propositions = useSelector(selectPropositions)
  const propositionsStatus = useSelector(selectPropositionsStatus)
  const [readOnly] = useState(false)

  function handleButton() {
    dispatch(createProposition())
  }

  useEffect(() => {
    if (propositionsStatus === 'idle') {
      dispatch(fetchPropositions())
    }

    let subscription
    subscription = API.graphql(graphqlOperation(subscriptions.onUpdateProposition))
      .subscribe({
        next: ({value}) => {
          console.log('dispatch', value.data)
          dispatch(updateProposition(value.data.onUpdateProposition))
        },
        error: error => console.warn(error)
      })

    return function cleanup() {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [dispatch, propositionsStatus])

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
        <Button onClick={handleButton}>call trigger</Button>
        <Text>Propositions</Text>
      </Heading>
      {propositionEntities}
    </React.Fragment>
  )
}
