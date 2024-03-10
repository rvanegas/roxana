import React, {useState, useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {SentenceMeta} from './SentenceMeta'
import {SentenceMode, ElementRef} from './discussion.d'
import {
  selectDiscussions,
  focusOnSentence,
  unsetFocus,
  replaceSentenceAction,
  propositionIdsFromArgument,
} from './discussionsSlice'

export function Argument({position, argument, discussionId}) {
  const propositionById = id => propositions.find(p => p.id === id)
  const propositionByIndex = index => propositions.find(p => p.index === index)
  const propositionIds = propositionIdsFromArgument(argument)
  const editorRef = React.createRef() as ElementRef
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  const [displayPropositionIds, setDisplayPropositionIds] = useState(propositionIds)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [argumentCodeInvalid, setArgumentCodeInvalid] = useState(false)
  const placeholder = argument.index === 1 ?
    'Type a sequence of proposition numbers. For example, "1 2 :3".' : null
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const readOnly = argument.status === 'draft' && argument.owner !== username
  const [mode, setMode] = useState<SentenceMode>('')

  let canonicalArgumentCode

  function toAlphaIndex(numberIndex) {
    numberIndex--
    const base = 'A'.charCodeAt(0)
    const divisor = 'Z'.charCodeAt(0) - base + 1
    let alphas = [] as string[]
    while (numberIndex >= 0) {
      const remainder = numberIndex % divisor
      alphas.unshift(String.fromCharCode(remainder + base))
      numberIndex = (numberIndex - remainder) / divisor - 1
    }
    return alphas.join('')
  }

  function buildArgumentCode() {
    const displayPropositions = displayPropositionIds.map(id => propositionById(id))
    let argumentCode = ''
    if (displayPropositions.length > 0) {
      const conclusionIndex = displayPropositions.pop().index
      argumentCode = `:${conclusionIndex}`
    }
    if (displayPropositions.length > 0) {
      const premiseIndexes = displayPropositions.map(p => p.index).join(' ')
      argumentCode = `${premiseIndexes} ${argumentCode}`
    }
    return argumentCode
  }

  function initialEditorState() {
    const contentState = ContentState.createFromText(buildArgumentCode())
    return EditorState.createWithContent(contentState)
  }

  function setDisplayFromArgumentCode(argumentCode) {
    const invalidPattern = /[^\d\s:]/
    const separatorPattern = /[\s:]+/

    if (invalidPattern.test(argumentCode)) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositionIndexes = argumentCode.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    if (displayPropositionIndexes.length !== (new Set(displayPropositionIndexes)).size) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositions = displayPropositionIndexes.map(propositionByIndex)
    if (displayPropositions.indexOf(undefined) !== -1) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositionIds = displayPropositions.map(p => p.id)
    setArgumentCodeInvalid(false)
    setDisplayPropositionIds(displayPropositionIds)
  }

  function handleFocus() {
    setMode('editing')
  }
  function handleBlur() {
    const argumentCode = buildArgumentCode()
    if (editorState.getCurrentContent().getPlainText() !== argumentCode) {
      canonicalArgumentCode = argumentCode
    }
    const key = argument.key
    const content = displayPropositionIds.join(' ')
    if (content !== argument.content) {
      const value = {key, section: 'arguments', discussionId, content}
      // @ts-ignore
      dispatch(replaceSentenceAction(value)).then(() => setMode(''))
      setMode('saving')
    }
    else {
      setMode('')
    }
  }

  function handleChange(editorState) {
    const argumentCode = editorState.getCurrentContent().getPlainText()
    setDisplayFromArgumentCode(argumentCode)
    if (canonicalArgumentCode) {
      const contentState = ContentState.createFromText(canonicalArgumentCode)
      setEditorState(EditorState.createWithContent(contentState))
      setArgumentCodeInvalid(false)
      canonicalArgumentCode = null
    }
    else {
      setEditorState(editorState)
    }
  }

  function myKeyBindingFn(e) {
    if (e.keyCode === 13) {
      return e.shiftKey ? 'next-line' : 'blur-line'
    }
    return getDefaultKeyBinding(e)
  }
  function handleKeyCommand(command) {
    if (command === 'next-line' || command === 'blur-line') {
      editorRef.current.blur()
      if (command === 'next-line') {
        dispatch(focusOnSentence('arguments', position + 1))
      }
      return 'handled'
    }
    return 'not-handled'
  }

  useEffect(() => {
    if (argument.autoFocus) {
      editorRef.current.focus()
      dispatch(unsetFocus({section: 'arguments', position}))
    }
  })

  const premiseIds = displayPropositionIds.slice(0, displayPropositionIds.length - 1)
  const premiseElements = premiseIds.length === 0 ? null : premiseIds.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.key}>
        <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>{premise.index}</View>
        <View columnEnd={-2}>{premise.content}</View>
      </React.Fragment>
    )
  })

  const conclusionIds = displayPropositionIds.slice(-1)
  const conclusionElements = conclusionIds.length === 0 ? null : conclusionIds.map(conclusionId => {
    const conclusion = propositionById(conclusionId)
    return (
      <React.Fragment key={conclusion.key}>
        <View columnStart={1} style={{justifySelf: 'end'}}>{'\u2234'}</View>
        <View style={{paddingRight: '10px', placeSelf: 'center end'}}>{conclusion.index}</View>
        <View columnEnd={-2}>{conclusion.content}</View>
      </React.Fragment>
    )
  })

  return (
    <React.Fragment key={argument.key}>
      <SentenceMeta sentence={argument} mode={mode} />
      <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>
        {toAlphaIndex(argument.index)}
      </View>
      <View>
        <Editor editorState={editorState} onChange={handleChange}
          keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} onFocus={handleFocus} readOnly={readOnly} ref={editorRef}
          placeholder={placeholder}
        />
        <Divider style={argumentCodeInvalid ? {borderColor: 'red'} : undefined}/>
      </View>
      {premiseElements}
      {conclusionElements}
      <View style={{paddingBottom: '10px'}} columnSpan={4} />
    </React.Fragment>
  )
}
