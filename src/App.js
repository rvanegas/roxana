import React from 'react'
import {Authenticator, AmplifyProvider} from '@aws-amplify/ui-react'
import {Grid, View, Heading, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css';
import {PropositionsList} from './features/discussion/PropositionsList'
import {ArgumentsList} from './features/discussion/ArgumentsList'
import {theme} from './theme'
// import DragTest from './DragTest'

function App() {
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}) => (
          <View>
            <Grid
              templateColumns="1rem 2rem 1fr 100px"
              gap="var(--amplify-space-small)"
            >
              <Heading columnSpan={3} level={3}>
                Hello, {user.username} ({user.attributes.email})!
              </Heading>
              <View columnSpan={1}>
                <Button onClick={signOut}>Sign out</Button>
              </View>
              <PropositionsList />
              <ArgumentsList />
            </Grid>
          </View>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
