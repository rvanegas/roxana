import React from 'react'
import {API, graphqlOperation, Hub} from 'aws-amplify'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

Hub.listen('auth', async (data) => {
  if (data.payload.event === 'signIn') {
    initializeUserFromAuth(data.payload.data.username)
  }
})

export const CurrentUserContext = React.createContext()

export async function initializeUserFromAuth(username) {
  console.log('getUser', username)
  const response = await API.graphql(graphqlOperation(queries.getUser, {username}))
  console.log('getUser', response)
  if (!response.data.getUser) {
    const response = await API.graphql(graphqlOperation(mutations.createUser, {input: {username}}))
    console.log('createUser', response)
  }
}
