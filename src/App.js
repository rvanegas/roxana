import React from 'react'
import { Authenticator, AmplifyProvider, View, Heading, Text, Button } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { theme } from './theme'

function App() {
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}) => (
          <View>
            <Heading level={3}>Hello, {user.username} ({user.attributes.email})!</Heading>
            <Text>{JSON.stringify(user.attributes)}</Text>
            <Button onClick={signOut}>Sign out</Button>
          </View>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
