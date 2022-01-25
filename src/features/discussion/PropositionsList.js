import React from 'react'
// import { useSelector } from 'react-redux'
import {
  View,
  // Button
} from '@aws-amplify/ui-react'
import { Proposition } from './Proposition'
// import {
//   propositionsSelector
// } from './propositionsSlice'


export function PropositionsList() {
  // console.log('sp')
  // const propositions = useSelector(state => {
  //   console.log('f', state)
  //   return propositionsSelector.selectAll(state.propositions)
  // })
  // console.log('s2', propositions)
  // const propositionEntities = propositions.selectIds().map(id => (
  //   <Proposition key={id} />
  // ))

  return (
    <View>
      {/*<Button onClick={() => {console.log(propositions)}}>state</Button>*/}
      {/*{propositionEntities}*/}
      <Proposition />
      <Proposition />
    </View>
  )
}
