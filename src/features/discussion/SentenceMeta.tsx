import React, {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Divider, Button, View} from '@aws-amplify/ui-react'
import classNames from 'classnames'
import {Section, Sentence, SentenceMode} from './discussion.d'
import {toAlphaIndex} from '../../app/util'
import {CurrentUserContext} from '../user/User'
import {
  changeSentenceStatusAction,
  selectDiscussions,
  isActionable
} from './discussionsSlice'

interface SentenceMetaProps {
  sentence: Sentence
  position: number
  section: Section
  mode: SentenceMode
  postSentence?: any
  dividerStyle: any
  editorElement: any
  readOnly: boolean
}

export function SentenceMeta({sentence, position, section, mode, postSentence, dividerStyle, editorElement, readOnly}: SentenceMetaProps) {
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const isArguments = section === 'arguments'

  function handleChangeStatus(change) {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change}))
  }

  function claimsSummary() {
    const accepted = sentence.accepted.filter(d => !discussions.hideDiscussants[d])
    const rejected = sentence.rejected.filter(d => !discussions.hideDiscussants[d])
    if (accepted.length > 0 && rejected.length > 0) {
      return [true, false]
    }
    else if (accepted.length > 1) {
      return [true, true]
    }
    else if (rejected.length > 1) {
      return [false, false]
    }
    else if (accepted.length === 1) {
      return [true]
    }
    else if (rejected.length === 1) {
      return [false]
    }
    else {
      return []
    }
  }

  const userClaim = sentence.accepted.includes(username) ? true
    : sentence.rejected.includes(username) ? false : null
  let underlined
  const annotations = claimsSummary().map((claim, index) => {
    const underline = !underlined && claim === userClaim && !discussions.hideDiscussants[username]
    underlined = underlined || underline
    let style = {
      color: (claim ? 'seagreen' : 'firebrick'),
      textDecoration: underline ? 'underline' : 'none'
    }
    return <span key={index} style={style}>{claim ? '\u2714' : '\u2718'}</span>
  })
  const irrational = sentence.irrational.filter(d => !discussions.hideDiscussants[d])
  if (irrational.length !== 0) {
    let underline = irrational.includes(username) && !discussions.hideDiscussants[username]
    let style = {
      color: 'red',
      fontWeight: 'bold',
      textDecoration: underline ? 'underline' : 'none'
    }
    annotations.push(<span key="i" style={style}>{'\u2049'}</span>)
  }
  if (sentence.inArgument) {
    annotations.unshift(<span key="a" style={{color: 'gray'}}>{'\u279c'}</span>)
  }
  const annotationIcons = (
    <View columnStart={1} className="sentence-meta" style={{placeSelf: 'start end'}}>
      {annotations}
    </View>
  )

  const fontWeight = readOnly ? 'bold' : 'normal'
  const indexLine = (
    <View columnStart={2} className="sentence-meta" style={{fontFamily: 'Comic Sans', fontWeight, paddingRight: '5px', placeSelf: 'start end'}}>
      {isArguments ? toAlphaIndex(position) : position+1}
    </View>
  )

  const actionButtons = ['edit', 'commit', 'accept', 'reject', 'clear'].map(action => (
    isActionable[action](sentence, username) &&
      <Button
        key={action} variation="link" size="small"
        style={{paddingBlockStart: '0px', paddingBlockEnd: '0px'}}
        onClick={() => handleChangeStatus(action)}
      >{action}</Button>
  ))

  const editorClassName = classNames({
    'discussion-editor': true,
    'discussion-editor-draft': sentence.status === 'draft' && sentence.owner === username
  })

  const editorLine = (
    <React.Fragment>
      <View columnStart={3}>
        <div className={editorClassName}>
          {editorElement}
          <Divider style={dividerStyle} />
          <div className={'discussion-actions'}>
            {actionButtons}
          </div>
        </div>
      </View>
      {postSentence}
    </React.Fragment>
  )

  return (
    <React.Fragment>
      {annotationIcons}
      {indexLine}
      {editorLine}
      {isArguments && <View style={{paddingBottom: '10px'}} columnSpan={4} />}
    </React.Fragment>
  )
}
