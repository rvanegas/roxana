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

  function discussionsSection(isPrivate: boolean) {
    const newButton = !username ? undefined : (
      <View style={{paddingBottom: '10px'}}>
        <Button variation="link" size="small" onClick={e => handleNewDiscussion(isPrivate)}
        >new</Button>
      </View>
    )
    const discussionsList = discussions.recentDiscussions[isPrivate ? 'privateDiscussions' : 'publicDiscussions']
    const links = discussionsList.map((discussion, index) => (
      <React.Fragment key={index}>
        <Link style={{fontSize: 'smaller', fontFamily: 'monaco'}}
          to={`/discussions/${discussion.id}`}
        >{discussion.id}
        </Link>
        <span style={{fontSize: 'smaller'}}>{dayjs(discussion.updatedAt).fromNow()}</span>
        <span className="text-ellipsis">
          {discussion.users.items.map(i => i.userID).join(',')}{' '}
          {discussion.goalsSummary}
        </span>
      </React.Fragment>
    ))
    return <>
      <Heading>
        {isPrivate ? 'Private' : 'Public'} discussions
      </Heading>
      <Grid
        style={{padding: '10px 10px'}}
        templateColumns="3rem 8rem 1fr"
        columnGap="var(--amplify-space-small)"
        rowGap="0"
      >
        {links}
      </Grid>
      {newButton}
    </>
  }

  const recentDiscussions = !discussions.recentDiscussions ? null : <>
    {discussionsSection(false)}
    {discussionsSection(true)}
  </>

  return (
    <View style={{paddingTop: '30px'}}>
      {recentDiscussions}
    </View>
  )
}
