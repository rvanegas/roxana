import React from 'react'
import {Authenticator, AmplifyProvider} from '@aws-amplify/ui-react'
import {Grid, Text, View, Heading, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css';
import {CurrentUserContext} from './features/user/User'
import {Discussion} from './features/discussion/Discussion'
import {theme} from './theme'
// import DragTest from './DragTest'

function App() {
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({signOut, user}: {signOut, user}) => (
          <CurrentUserContext.Provider value={user}>
            <View padding="20px">
              <View>
                <Grid
                  templateColumns="4fr 1fr 7rem"
                  gap="var(--amplify-space-small)"
                >
                  <Heading alignSelf="flex-start" level={3}>
                    Roxana
                  </Heading>
                  <Text alignSelf="center" style={{justifySelf: 'end'}}>
                    {user.username}
                  </Text>
                  <Button variation="link" size="small" onClick={signOut}>Sign out</Button>
                </Grid>
              </View>
              <View>
                <Discussion/>
              </View>
            </View>
          </CurrentUserContext.Provider>
        )}
      </Authenticator>
    </AmplifyProvider>
  )
}

export default App
