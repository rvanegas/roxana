import React, {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {BrowserRouter, Routes, Route, Outlet, useParams, useLocation, useNavigate} from 'react-router-dom'
import {Authenticator, useAuthenticator, Flex, Text, View, Heading, Button} from '@aws-amplify/ui-react'
import classNames from 'classnames'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css'
import {dlog} from './app/util'
import {CurrentUserContext} from './features/user/User'
import {Discussion} from './features/discussion/Discussion'
import {DiscussionsList} from './features/discussion/DiscussionsList'
import {selectDiscussions, discussionsSlice} from './features/discussion/discussionsSlice'
import {acceptInviteCode} from './features/discussion/data'

export function App() {
  const dispatch = useDispatch()
  const [reloadPath, setReloadPath] = useState('')
  // @ts-ignore
  const {user, signOut}: {user: any, signOut: () => {}} = useAuthenticator(context => [context.user])

  function SignIn() {
    return (
      <Authenticator>
        {({signOut, user}: {signOut, user}) => {
          window.location.href = reloadPath
          return <div/>
        }}
      </Authenticator>
    )
  }

  function Home() {
    const navigate = useNavigate()
    const location = useLocation()
    const discussions = useSelector(selectDiscussions)
    const username = user?.username
    const usernameChanged = discussions.username !== username
    const isSynced = discussions.eventQueue.length === 0
    const eventMessages = discussions.eventQueue.map(e => e.message).join('\n')
    const {setNewDiscussionId, setUsername} = discussionsSlice.actions

    useEffect(() => {
      if (usernameChanged) {
        dispatch(setUsername(username))
        if (username === 'rodvandur') {
          dlog.enabled = true
        }
      }
    }, [setUsername, usernameChanged, username])

    useEffect(() => {
      const newDiscussionId = discussions.newDiscussionId
      if (newDiscussionId) {
        dispatch(setNewDiscussionId(null))
        navigate(`/discussions/${newDiscussionId}`)
      }
    }, [navigate, setNewDiscussionId, discussions.newDiscussionId])

    useEffect(() => {
      if (location.pathname === '/') {
        navigate('/discussions')
      }
    }, [navigate, location])

    function handleHome() {
      navigate('/')
    }

    function navigateToSignIn() {
      setReloadPath(window.location.pathname)
      navigate('/signin')
    }

    const indicatorClasses = classNames('indicator', {'synced': isSynced})
    const locationInDiscussion = (new RegExp('/discussions/\\w+')).test(location.pathname)
    const lockIcon = !discussions.isPrivate ? null :
      <span style={{paddingLeft: '5px'}} className="oi sentence-icon" data-glyph="lock-locked" />
    const discussionElement = <Text>discussion: {discussions.discussionId} {lockIcon}</Text>
    const syncIndicator = <View title={eventMessages} className={indicatorClasses}></View>
    const signInOrOutButton = location.pathname === '/signin' ? null : user ?
      <Button variation="link" size="small" onClick={signOut}>sign out</Button> :
      <Button variation="link" size="small" onClick={navigateToSignIn}>sign in</Button>

    return (
      <CurrentUserContext.Provider value={user}>
        <View padding="10px 10px 0">
          <Flex
            justifyContent="space-between"
            className="navbar"
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
              {user ? syncIndicator : undefined}
              <Text>
                {user?.username}
              </Text>
              {signInOrOutButton}
            </Flex>
          </Flex>
          <Outlet />
        </View>
      </CurrentUserContext.Provider>
    )
  }

  function Invite() {
    const params = useParams()
    const discussions = useSelector(selectDiscussions)
    const {setNewInviteCode} = discussionsSlice.actions

    // search for discussion by id
    // if found,
    // add to users
    // navigate to /discussions/id
    // else
    // SOL

    useEffect(() => {
      if (discussions.username && !discussions.newInviteCode && params.inviteCode) {
        dispatch(setNewInviteCode(params.inviteCode))
        dispatch(acceptInviteCode(params.inviteCode))
      }
    }, [discussions.username, discussions.newInviteCode, params.inviteCode, setNewInviteCode])

    return null
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} >
          <Route path="signin" element={<SignIn/>} />
          <Route path="discussions">
            <Route index element={<DiscussionsList/>} />
            <Route path=":discussionId" element={<Discussion/>} />
          </Route>
          <Route path="invite">
            <Route path=":inviteCode" element={<Invite/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
