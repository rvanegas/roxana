import React, {useEffect} from 'react'
import {BrowserRouter, Routes, Route, Outlet, useLocation, useSearchParams, useNavigate, Navigate} from 'react-router-dom'
import {Authenticator, useAuthenticator, Grid, Text, View, Heading, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css'
import {CurrentUserContext} from './features/user/User'
import {Discussion} from './features/discussion/Discussion'
import {DiscussionsList} from './features/discussion/DiscussionsList'
// import DragTest from './DragTest'

export default function App() {
  // @ts-ignore
  const {user, signOut}: {user: any, signOut: () => {}} = useAuthenticator(context => [context.user])

  function SignIn() {
    const [searchParams] = useSearchParams()
    const path = decodeURI(searchParams.get('path') || '/')
    return (
      <Authenticator>
        {({signOut, user}: {signOut, user}) =>
          <Navigate to={path} replace={true} />
        }
      </Authenticator>
    )
  }

  function Home() {
    const location = useLocation()
    const navigate = useNavigate()

    function handleHome() {
      navigate('/')
    }

    function navigateToSignIn() {
      const signInUrl = `/signin?path=${encodeURI(location.pathname)}`
      navigate(signInUrl)
    }

    useEffect(() => {
      if (location.pathname === '/') {
        navigate('/discussions')
      }
    }, [location, navigate])

    const signInOrOutButton = location.pathname === '/signin' ?
      null : user ?
        <Button variation="link" size="small" onClick={signOut}>sign out</Button> :
        <Button variation="link" size="small" onClick={navigateToSignIn}>sign in</Button>

    return (
      <CurrentUserContext.Provider value={user}>
        <View padding="20px">
          <View>
            <Grid
              templateColumns="4fr 1fr 7rem"
              gap="var(--amplify-space-small)"
            >
              <Heading
                alignSelf="flex-start" level={3}
                onClick={handleHome}
                style={{userSelect: 'none', cursor: 'pointer'}}
              >
                Roxana
              </Heading>
              <Text alignSelf="center" style={{justifySelf: 'end'}}>
                {user?.username}
              </Text>
              {signInOrOutButton}
            </Grid>
          </View>
          <View>
            <Outlet />
          </View>
        </View>
      </CurrentUserContext.Provider>
    )
  }

  function Discussions() {
    return <Outlet/>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} >
          <Route path="signin" element={<SignIn/>} />
          <Route path="discussions" element={<Discussions/>} >
            <Route index element={<DiscussionsList/>} />
            <Route path=":discussionId" element={<Discussion/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
