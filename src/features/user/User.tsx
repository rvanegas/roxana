import React from 'react'
import { generateClient } from 'aws-amplify/api'
import { Hub } from 'aws-amplify/utils'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

let _client: ReturnType<typeof generateClient> | null = null
const client = () => { if (!_client) _client = generateClient({ authMode: 'apiKey' }); return _client }

Hub.listen('auth', async (data) => {
  if (data.payload.event === 'signedIn') {
    const username = (data.payload.data as any)?.username
    console.log('data', data)
    if (username) {
      initializeUserFromAuth(username)
    }
  }
})

export const CurrentUserContext = React.createContext(null)

export async function initializeUserFromAuth(username) {
  console.log('initializeUserFromAuth', username)
  const response = await client().graphql({ query: queries.getUser, variables: { username } }) as any
  console.log('getUser', response)
  if (!response.data.getUser) {
    const response = await client().graphql({ query: mutations.createUser, variables: { input: { username } } })
    console.log('createUser', response)
  }
}
