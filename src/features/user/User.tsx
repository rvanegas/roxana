import React, {createContext, useCallback, useContext, useEffect, useState} from 'react'
import { generateClient } from 'aws-amplify/api'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import {NoesisUser, currentUser, signOut as noesisSignOut} from './auth'

// generateClient's return type is a deeply recursive generic that TS cannot
// compare without exceeding its stack-depth limit; the client is used untyped
// here (raw graphql strings, results cast to any), so annotate it plainly.
let _client: any = null
const client = () => { if (!_client) _client = generateClient({ authMode: 'apiKey' }); return _client }

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

// Who is signed in, through noesis (auth.ts). `route` is 'loading' until
// noesis has answered, then 'authenticated' or 'signedOut'.
type Auth = {user: NoesisUser | null, route: 'loading' | 'authenticated' | 'signedOut', signOut: () => void}

const AuthContext = createContext<Auth>({user: null, route: 'loading', signOut: () => {}})

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<NoesisUser | null>(null)
  const [route, setRoute] = useState<Auth['route']>('loading')

  useEffect(() => {
    // The callback page signs in, then reloads into where the person was.
    // (Amplify Hosting serves it as /signin/.)
    if (window.location.pathname.replace(/\/$/, '') === '/signin') return
    currentUser().then(found => {
      setUser(found)
      setRoute(found ? 'authenticated' : 'signedOut')
      if (found) initializeUserFromAuth(found.username)
    }).catch(e => {
      console.error('[auth] noesis', e)
      setRoute('signedOut')
    })
  }, [])

  const signOut = useCallback(() => {
    noesisSignOut().finally(() => {
      setUser(null)
      setRoute('signedOut')
    })
  }, [])

  return <AuthContext.Provider value={{user, route, signOut}}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
