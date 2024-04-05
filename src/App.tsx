import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {BrowserRouter, Routes, Route, Outlet, useLocation, useSearchParams, useNavigate} from 'react-router-dom'
import {Authenticator, useAuthenticator, Flex, Text, View, Heading, Button} from '@aws-amplify/ui-react'
import classNames from 'classnames'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css'
import {CurrentUserContext} from './features/user/User'
import {Discussion} from './features/discussion/Discussion'
import {DiscussionsList} from './features/discussion/DiscussionsList'
import {selectDiscussions} from './features/discussion/discussionsSlice'
// import DragTest from './DragTest'

export default function App() {
  const [reloadPath, setReloadPath] = useState('')
  // @ts-ignore
  const {user, signOut}: {user: any, signOut: () => {}} = useAuthenticator(context => [context.user])

  function SignIn() {
    const uri = `/?path=${encodeURI(reloadPath)}`
    return (
      <Authenticator>
        {({signOut, user}: {signOut, user}) => {
          window.location.href = uri
          return <div/>
        }}
      </Authenticator>
    )
  }

// <Navigate to={path} replace={true} />

  function Home() {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const path = searchParams.get('path')
    const discussions = useSelector(selectDiscussions)
    const isSynced = discussions.eventQueue.length === 0

    useEffect(() => {
      if (path) {
        navigate(path)
      }
      else if (location.pathname === '/') {
        navigate('/discussions')
      }
    }, [path, location, navigate])

    function handleHome() {
      navigate('/')
    }

    function navigateToSignIn() {
      setReloadPath(window.location.pathname)
      navigate('/signin')
    }

    const signInOrOutButton = location.pathname === '/signin' ? null : user ?
      <Button variation="link" size="small" onClick={signOut}>sign out</Button> :
      <Button variation="link" size="small" onClick={navigateToSignIn}>sign in</Button>

    const indicatorClasses = classNames(
      'indicator',
      {
        'synced': isSynced,
        'unsynced': !isSynced
      }
    )

    const locationInDiscussion = (new RegExp('/discussions/\\w+')).test(location.pathname)
    const discussionElement = <Text>discussion: {discussions.discussionId}</Text>

    return (
      <CurrentUserContext.Provider value={user}>
        <View padding="20px">
          <Flex
            justifyContent="space-between"
            style={{userSelect: 'none'}}
          >
            <Flex
              justifyContent="flex-end"
              alignItems="baseline"
            >
              <Heading
                level={3}
                onClick={handleHome}
                style={{cursor: 'pointer'}}
              >
                Roxana
              </Heading>
              {locationInDiscussion ? discussionElement : undefined}
              </Flex>
            <Flex
              justifyContent="flex-end"
              alignItems="center"
              style={{paddingTop: '6px'}}
            >
              <View className={indicatorClasses}></View>
              <Text>
                {user?.username}
              </Text>
              {signInOrOutButton}
            </Flex>
          </Flex>
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
