import React from 'react'
import {
  Authenticator, AmplifyProvider,
  View, Heading, Button
} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css';
import { Proposition } from './Proposition'
import { theme } from './theme'


function App() {
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}) => (
          <View>
            <Heading level={3}>Hello, {user.username} ({user.attributes.email})!</Heading>
            <Button onClick={signOut}>Sign out</Button>
            <Proposition/>
          </View>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
