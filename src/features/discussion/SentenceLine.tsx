import React, {useState, useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import classNames from 'classnames'
import {CurrentUserContext} from '../user/User'
import {toAlphaIndex} from '../../app/util'
import {Section, Sentence, ElementRef} from './discussion.d'
import {
  selectDiscussions,
  propositionIndexesFromArgument,
  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
  changeSentenceStatusAction,
  changeGoalSentenceAction,
  isActionable,
} from './discussionsSlice'
import './discussion.css'

interface SentenceProps {
  section: Section
  sentence: Sentence
  position: number
}

export function SentenceLine(props: SentenceProps) {
  const {section, sentence, position} = props
  const isArguments = section === 'arguments'
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const propositionIndexes = section === 'arguments' ? propositionIndexesFromArgument(sentence) : []
  const editorRef = React.createRef() as ElementRef
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  const [displayPropositionIndexes, setDisplayPropositionIndexes] = useState(propositionIndexes)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [argumentInputInvalid, setArgumentInputInvalid] = useState(false)
  const placeholder = position !== 0 ? null : (
    section === 'propositions' ?
      'Type a proposition. For example, "Socrates is a man."' :
      'Type a sequence of proposition numbers. For example, "1 2 3".'
  )
  const readOnly = !(username && isActionable.edit(sentence, username))
  let canonicalContent

  function initialEditorState() {
    const contentState = ContentState.createFromText(sentence.content)
    return EditorState.createWithContent(contentState)
  }

  function setDisplayFromArgumentInput(argumentInput) {
    const invalidPattern = /[^\d\s]/
    const separatorPattern = /\s+/

    if (invalidPattern.test(argumentInput)) {
      // console.warn('invalid pattern, syntax')
      setArgumentInputInvalid(true)
      return
    }
    const indexes = argumentInput.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    if (indexes.length !== (new Set(indexes)).size) {
      // console.warn('invalid pattern, numbers')
      setArgumentInputInvalid(true)
      return
    }
    const displayPropositions = indexes.map(i => propositions[i-1])
    if (displayPropositions.indexOf(undefined) !== -1) {
      // console.warn('invalid pattern, references')
      setArgumentInputInvalid(true)
      return
    }
    if (displayPropositions.some(p => p.status !== 'committed')) {
      // console.warn('invalid pattern, uncommitted', displayPropositions)
      setArgumentInputInvalid(true)
      return
    }
    setArgumentInputInvalid(false)
    setDisplayPropositionIndexes(indexes)
  }

  function handleChange(editorState) {
    if (canonicalContent !== undefined) {
      const contentState = ContentState.createFromText(canonicalContent)
      setEditorState(EditorState.createWithContent(contentState))
      setArgumentInputInvalid(false)
    }
    else if (section === 'arguments') {
      const argumentInput = editorState.getCurrentContent().getPlainText()
      setDisplayFromArgumentInput(argumentInput)
      setEditorState(editorState)
    }
    else {
      setEditorState(editorState)
    }
  }

  function handleFocus() {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'edit'}))
  }

  function propositionElements() {
    if (section === 'propositions') {
      return null
    }
    return displayPropositionIndexes.map((index, mapIndex) => {
      const proposition = propositions[index-1]
      const therefore = (mapIndex !== displayPropositionIndexes.length - 1) ? null
        : <View columnStart={1} className="sentence-meta">
          <div style={{textAlign: 'right'}}>
            <span key="a" className="oi" style={{color: 'gray'}} data-glyph="arrow-thick-right" title="arrow" />
          </div>
        </View>
      return (
        <React.Fragment key={proposition.key}>
          {therefore}
          <View columnStart={2} className="sentence-index">
            <div style={{textAlign: 'right'}}>{index}</div>
          </View>
          <View columnEnd={-2}>{proposition.content}</View>
        </React.Fragment>
      )
    })
  }

  function setFinalContent() {
    if (canonicalContent) {
      return canonicalContent
    }
    else if (section === 'arguments') {
      const content = displayPropositionIndexes.join(' ')
      if (editorState.getCurrentContent().getPlainText() !== sentence.content) {
        canonicalContent = content
      }
      return content
    }
    else {
      return editorState.getCurrentContent().getPlainText()
    }
  }

  function handleBlur() {
    const content = setFinalContent()
    if (content !== sentence.content || sentence.status === 'draft') {
      const input = {key: sentence.key, section, content}
      dispatch(replaceSentenceAction(input))
    }
  }

  function myKeyBindingFn(e) {
    if (e.keyCode === 13) {
      return e.shiftKey ? 'next-line' : 'blur-line'
    }
    if (e.keyCode === 27) {
      return 'escape'
    }
    return getDefaultKeyBinding(e)
  }

  function handleKeyCommand(command) {
    if (command === 'next-line' || command === 'blur-line') {
      editorRef.current.blur()
      if (command === 'next-line') {
        dispatch(focusOnSentence(section, position + 1))
      }
      return 'handled'
    } else if (command === 'escape') {
      canonicalContent = sentence.content
      setDisplayFromArgumentInput(canonicalContent)
      editorRef.current.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  useEffect(() => {
    if (sentence.autoFocus) {
      editorRef.current.focus()
      dispatch(unsetFocus({section, position}))
    }
  })

  const dividerStyle = argumentInputInvalid ? {borderColor: 'red'} : undefined
  const postSentence = (<React.Fragment>{propositionElements()}</React.Fragment>)

  const editorElement = (
    <Editor
      editorState={editorState} onChange={handleChange}
      keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
      onBlur={handleBlur} onFocus={handleFocus}
      readOnly={readOnly} ref={editorRef}
      placeholder={placeholder}
    />
  )

  function handleStatusToggle() {
    if (sentence.status !== 'committed') {
      return
    }
    if (sentence.accepted.includes(username)) {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'reject'}))
    }
    else if (sentence.rejected.includes(username)) {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'clear'}))
    }
    else {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'accept'}))
    }
  }

  function handleGoalSet() {
    if (sentence.status !== 'committed' || section !== 'propositions') {
      return
    }
    dispatch(changeGoalSentenceAction({position}))
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
      borderBottom: underline ? '1px gray solid' : 'none'
    }
    return claim ?
      <span key={index} className="oi" style={style} data-glyph="check" /> :
      <span key={index} className="oi" style={style} data-glyph="x" />
  })
  if (sentence.inArgument) {
    annotations.unshift(<span key="a" className="oi" style={{color: 'gray'}} data-glyph="arrow-thick-right" />)
  }
  const irrational = sentence.irrational.filter(d => !discussions.hideDiscussants[d])
  if (irrational.length !== 0) {
    let underline = irrational.includes(username) && !discussions.hideDiscussants[username]
    let style = {
      color: 'gold',
      borderBottom: underline ? '1px gray solid' : 'none'
    }
    annotations.unshift(<span key="i" className="oi" style={style} data-glyph="warning" />)
  }

  const annotationIcons = (
    <View
      columnStart={1} className="sentence-meta" style={{height: '100%', width: '100%', position: 'relative'}}
      onClick={username && handleStatusToggle}
    >
      <div style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
      <div style={{textAlign: 'right'}}>
        {annotations}
      </div>
    </View>
  )

  const goal = sentence.goal.filter(d => !discussions.hideDiscussants[d])
  const indexStyle = {
    fontWeight: 'bold',
    border: goal.includes(username) ? '1px gray double' : goal.length !== 0 ? '1px gray dashed' : 'none',
    height: '20px',
    width: '20px',
    position: 'relative'
  }

  const indexLine = (
    <View
      columnStart={2} className="sentence-index" style={indexStyle}
      onClick={username && handleGoalSet}
    >
      <div style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
      <div style={{textAlign: 'right'}}>
        {isArguments ? toAlphaIndex(position) : position+1}
      </div>
    </View>
  )

  const editingStatus = (
    <div className={'discussion-actions'}>
      ...{sentence.owner} editing
    </div>
  )

  const editorClassName = classNames({
    'discussion-editor': true,
    'discussion-editor-draft': sentence.status === 'draft' && sentence.owner === username
  })

  const anothersDraft = sentence.status === 'draft' && sentence.owner !== username

  const editorLine = (
    <React.Fragment>
      <View columnStart={3}>
        <div className={editorClassName}>
          {editorElement}
          {anothersDraft ? editingStatus : undefined}
          <Divider style={dividerStyle} />
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
