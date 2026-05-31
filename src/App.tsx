import React, {useEffect} from 'react'
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
import {AppDispatch} from './app/store'

function Home() {
  const dispatch = useDispatch<AppDispatch>()
  // @ts-ignore
  const {user, signOut, route}: {user: any, signOut: () => {}, route: string} = useAuthenticator(context => [context.user])

  const navigate = useNavigate()
  const location = useLocation()
  const discussions = useSelector(selectDiscussions)
  const username = user?.username
  const isSynced = discussions.eventQueue.length === 0
  const eventMessages = discussions.eventQueue.map(e => e.message).join('\n')
  const {setNewDiscussionId, setReloadPath, setUsername} = discussionsSlice.actions

  useEffect(() => {
    dispatch(setUsername(username))
    if (username === 'rodvandur' || username === 'kaipebbles') {
      dlog.enabled = true
    }
  }, [dispatch, setUsername, username])

  useEffect(() => {
    const newDiscussionId = discussions.newDiscussionId
    if (newDiscussionId) {
      dispatch(setNewDiscussionId(null))
      navigate(`/discussions/${newDiscussionId}`)
    }
  }, [dispatch, navigate, setNewDiscussionId, discussions.newDiscussionId])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/discussions')
    }
  }, [navigate, location])

  function handleHome() {
    navigate('/')
  }

  function navigateToSignIn() {
    dispatch(setReloadPath(window.location.pathname))
    navigate('/signin')
  }

  const roxanaHeader = <Heading level={3} onClick={handleHome}
    style={{cursor: 'pointer'}}>Roxana</Heading>
  const indicatorClasses = classNames('indicator', {'synced': isSynced})
  const locationInDiscussion = (new RegExp('/discussions/\\w+')).test(location.pathname)
  const lockIcon = !discussions.isPrivate ? null :
    <span style={{paddingLeft: '5px'}} className="oi sentence-icon" data-glyph="lock-locked" />
  const discussionElement = <Text>discussion: {discussions.discussionId} {lockIcon}</Text>
  const discussionElementIfAny = locationInDiscussion ? discussionElement : undefined
  const syncIndicator = <View title={eventMessages} className={indicatorClasses}></View>
  const syncIndicatorIfAny = user ? syncIndicator : undefined
  const usernameIfAny = user ? <Text>{user.username}</Text> : undefined
  const signInOrOutButton = location.pathname === '/signin' ? null : user ?
    <Button variation="link" size="small" onClick={signOut}>sign out</Button> :
    <Button variation="link" size="small" onClick={navigateToSignIn}>sign in</Button>

  return (
    // @ts-ignore
    <CurrentUserContext.Provider value={{user, route}}>
      <View padding="10px 10px 0">
        <Flex
          justifyContent="space-between"
          className="navbar"
        >
          <View display={{small: 'none'}}>
            {roxanaHeader}
            {discussionElementIfAny}
          </View>
          <View display={{small: 'none'}}>
            <Flex
              justifyContent="flex-end"
              alignItems="center"
              style={{paddingTop: '6px'}}
            >
              {usernameIfAny}
            </Flex>
            <Flex
              justifyContent="flex-end"
              alignItems="center"
              style={{paddingTop: '6px'}}
            >
              {syncIndicatorIfAny}
              {signInOrOutButton}
            </Flex>
          </View>
          <Flex
            display={{base: 'none', small: 'flex'}}
            justifyContent="flex-end"
            alignItems="baseline"
          >
            {roxanaHeader}
            {discussionElementIfAny}
          </Flex>
          <Flex
            display={{base: 'none', small: 'flex'}}
            justifyContent="flex-end"
            alignItems="center"
            style={{paddingTop: '6px'}}
          >
            {syncIndicatorIfAny}
            {usernameIfAny}
            {signInOrOutButton}
          </Flex>
        </Flex>
        <Outlet />
      </View>
    </CurrentUserContext.Provider>
  )
}

function SignIn() {
  const discussions = useSelector(selectDiscussions)

  return (
    <Authenticator>
      {({signOut, user}) => {
        window.location.href = discussions.reloadPath
        return <div/>
      }}
    </Authenticator>
  )
}

function Invite() {
  const dispatch = useDispatch<AppDispatch>()
  const params = useParams()
  const discussions = useSelector(selectDiscussions)
  const {setNewInviteCode} = discussionsSlice.actions

  useEffect(() => {
    if (discussions.username && !discussions.newInviteCode && params.inviteCode) {
      dispatch(setNewInviteCode(params.inviteCode))
      dispatch(acceptInviteCode(params.inviteCode))
    }
  }, [dispatch, discussions.username, discussions.newInviteCode, params.inviteCode, setNewInviteCode])

  return null
}

export function App() {

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
