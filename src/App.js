import React from 'react'
import {Authenticator, AmplifyProvider} from '@aws-amplify/ui-react'
import {Grid, Text, View, Heading, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css';
import {PropositionsList} from './features/discussion/PropositionsList'
import {ArgumentsList} from './features/discussion/ArgumentsList'
import {theme} from './theme'
// import DragTest from './DragTest'

const discussionId = 'a1283cfc-61fa-4e4e-a93d-c82cd9d7350a'

function App() {
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}) => (
          <View padding="20px">
            <View>
              <Grid
                templateColumns="3fr 1fr 7rem"
                gap="var(--amplify-space-small)"
              >
                <Heading alignSelf="flex-start" level={3}>
                  Roxana
                </Heading>
                <Text alignSelf="center" style={{justifySelf: 'end'}}>
                  {user.username}
                </Text>
                <Button onClick={signOut}>Sign out</Button>
              </Grid>
            </View>
            <View>
              <Grid
                templateColumns="1rem 2rem 1fr 3rem"
                gap="var(--amplify-space-small)"
              >
                <PropositionsList discussionId={discussionId} />
                <ArgumentsList discussionId={discussionId} />
              </Grid>
            </View>
          </View>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
