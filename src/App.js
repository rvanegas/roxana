import React from 'react'
import {
  Authenticator, AmplifyProvider,
  View, Heading, Button
} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css';
import { PropositionsList } from './features/discussion/PropositionsList'
import { theme } from './theme'
import DragTest from './DragTest'

function App() {

  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}) => (
          <View>
            <Heading level={3}>Hello, {user.username} ({user.attributes.email})!</Heading>
            <Button onClick={signOut}>Sign out</Button>
            <PropositionsList />
            {user.username === 'rodvandur' && <DragTest/>}
          </View>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
