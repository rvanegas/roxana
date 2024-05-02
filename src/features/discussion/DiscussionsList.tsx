import React, {useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'
import {Heading, View, Grid, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {CurrentUserContext} from '../user/User'
import {selectDiscussions} from './discussionsSlice'
import {loadRecentDiscussions, createNewDiscussionAction} from './data'
dayjs.extend(relativeTime)

let lastLoaded

export function DiscussionsList() {
  const dispatch = useDispatch()
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const discussions = useSelector(selectDiscussions)

  useEffect(() => {
    // debounce due to unexpected multiple loads of component
    const now = Date.now()
    if (!lastLoaded || now - lastLoaded > 1000) {
      lastLoaded = now
      dispatch(loadRecentDiscussions())
    }
  })

  function handleNewDiscussion(isPrivate: boolean) {
    dispatch(createNewDiscussionAction({isPrivate}))
  }

  const newPublicButton = !username ? undefined : (
    <View style={{paddingBottom: '10px'}}>
      <Button variation="link" size="small" onClick={e => handleNewDiscussion(false)}
      >new public</Button>
    </View>
  )
  const newPrivateButton = !username ? undefined : (
    <View style={{paddingBottom: '10px'}}>
      <Button variation="link" size="small" onClick={e => handleNewDiscussion(true)}
      >new private</Button>
    </View>
  )
  const links = discussions.recentDiscussions.map((discussion, index) => (
    <React.Fragment key={index}>
      <Link style={{fontSize: 'smaller', fontFamily: 'monaco'}}
        to={`/discussions/${discussion.id}`}
      >{discussion.id}
      </Link>
      <span style={{fontSize: 'smaller'}}>{dayjs(discussion.updatedAt).fromNow()}</span>
      <span className="text-ellipsis">{discussion.goalsSummary}</span>
    </React.Fragment>
  ))

  return (
    <View>
      <Heading style={{paddingTop: '30px'}}>
        Discussions
      </Heading>
      <Grid
        style={{padding: '10px 10px'}}
        templateColumns="3rem 8rem 1fr"
        columnGap="var(--amplify-space-small)"
        rowGap="0"
      >
        {links}
      </Grid>
      {newPublicButton}
      {newPrivateButton}
    </View>
  )
}
