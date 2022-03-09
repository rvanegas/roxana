import React from 'react'
import {API, graphqlOperation, Hub} from 'aws-amplify'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

Hub.listen('auth', async (data) => {
  if (data.payload.event === 'signIn') {
    const username = data.payload.data.username
    console.log('data', data)
    if (username) {
      initializeUserFromAuth(username)
    }
  }
})

export const CurrentUserContext = React.createContext(null)

export async function initializeUserFromAuth(username) {
  console.log('initializeUserFromAuth', username)
  const response = await API.graphql(graphqlOperation(queries.getUser, {username})) as any
  console.log('getUser', response)
  if (!response.data.getUser) {
    const response = await API.graphql(graphqlOperation(mutations.createUser, {input: {username}}))
    console.log('createUser', response)
  }
}
