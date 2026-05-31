import React, {Fragment, useEffect} from 'react'
import {useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {AppDispatch} from '../../app/store'
import {Link} from 'react-router-dom'
import {Heading, View, Grid, Button} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import 'draft-js/dist/Draft.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {CurrentUserContext} from '../user/User'
import {selectDiscussions} from './discussionsSlice'
import {loadRecentDiscussions, createNewDiscussionAction, usernamesFromDiscussion} from './data'
dayjs.extend(relativeTime)

export function DiscussionsList() {
  const dispatch = useDispatch<AppDispatch>()
  const {route} = useContext(CurrentUserContext) as unknown as {user, route}
  const discussions = useSelector(selectDiscussions)
  const username = discussions.username

  useEffect(() => {
    dispatch(loadRecentDiscussions())
  }, [dispatch, username])

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
    const discussionsList = discussions.recentDiscussions?.[isPrivate ? 'privateDiscussions' : 'publicDiscussions'] ?? []
    const myDiscussionsList = !isPrivate ? discussionsList :
      discussionsList.filter(item => usernamesFromDiscussion(item.discussion).includes(username))
    const links = myDiscussionsList.map((item, index) => {
      const discussion = isPrivate ? item.discussion : item
      const discussants = () => usernamesFromDiscussion(discussion).join(', ')
      const description = isPrivate ? `[${discussants()}] ${discussion.goalsSummary}` : discussion.goalsSummary

      return (
        <Fragment key={index}>
          <Link style={{fontSize: 'smaller', fontFamily: 'monaco'}}
            to={`/discussions/${discussion.id}`}
          >{discussion.id}
          </Link>
          <span style={{fontSize: 'smaller'}}>{dayjs(discussion.updatedAt).fromNow()}</span>
          <span className="text-ellipsis">{description}</span>
        </Fragment>
      )
    })
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

  return (
    <View style={{paddingTop: '30px'}}>
      {discussionsSection(false)}
      {discussionsSection(true)}
    </View>
  )
}
