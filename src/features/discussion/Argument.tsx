import React, {useState, useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {toAlphaIndex} from '../../app/util'
import {SentenceMeta} from './SentenceMeta'
import {Section, SentenceMode, ElementRef} from './discussion.d'
import {
  selectDiscussions,
  focusOnSentence,
  unsetFocus,
  replaceSentenceAction,
  ReplaceSentenceInput,
  propositionIndexesFromArgument,
} from './discussionsSlice'

export function Argument({position, argument, discussionId}) {
  const section: Section = 'arguments'
  // @ts-ignore
  const isArguments = section === 'arguments'
  const propositionIndexes = propositionIndexesFromArgument(argument)
  const editorRef = React.createRef() as ElementRef
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  const [displayPropositionIndexes, setDisplayPropositionIndexes] = useState(propositionIndexes)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [argumentInputInvalid, setArgumentInputInvalid] = useState(false)
  const placeholder = argument.index === 1 ?
    'Type a sequence of proposition numbers. For example, "1 2 3".' : null
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const readOnly = !(argument.status === 'draft' && argument.owner === username)
  const [mode, setMode] = useState<SentenceMode>('')

  let canonicalContent

  function initialEditorState() {
    const contentState = ContentState.createFromText(argument.content)
    return EditorState.createWithContent(contentState)
  }

  function setDisplayFromArgumentInput(argumentInput) {
    const invalidPattern = /[^\d\s]/
    const separatorPattern = /\s+/

    if (invalidPattern.test(argumentInput)) {
      setArgumentInputInvalid(true)
      return
    }
    const indexes = argumentInput.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    if (indexes.length !== (new Set(indexes)).size) {
      setArgumentInputInvalid(true)
      return
    }
    const displayPropositions = indexes.map(i => propositions[i-1])
    if (displayPropositions.indexOf(undefined) !== -1) {
      setArgumentInputInvalid(true)
      return
    }
    if (displayPropositions.some(p => p.status !== 'committed')) {
      setArgumentInputInvalid(true)
      return
    }
    setArgumentInputInvalid(false)
    setDisplayPropositionIndexes(indexes)
  }

  function handleFocus() {
    setMode('editing')
  }
  function handleBlur() {
    const content = displayPropositionIndexes.join(' ')
    if (editorState.getCurrentContent().getPlainText() !== argument.content) {
      canonicalContent = content
    }
    if (content === argument.content) {
      setMode('')
    }
    else {
      const value: ReplaceSentenceInput = {key: argument.key, section: 'arguments', content}
      const response = dispatch(replaceSentenceAction(value)) as unknown as {then(any)}
      response.then(() => setMode(''))
      setMode('saving')
    }
  }

  function handleChange(editorState) {
    const argumentInput = editorState.getCurrentContent().getPlainText()
    setDisplayFromArgumentInput(argumentInput)
    if (canonicalContent !== undefined) {
      const contentState = ContentState.createFromText(canonicalContent)
      setEditorState(EditorState.createWithContent(contentState))
      setArgumentInputInvalid(false)
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

  //////////////////

  let propositionElements
  const indexesLength = displayPropositionIndexes.length
  if (indexesLength !== 0) {
    propositionElements = displayPropositionIndexes.map((index, mapIndex) => {
      const proposition = propositions[index-1]
      const therefore = (mapIndex !== indexesLength-1) ? null
        : <View columnStart={1} style={{justifySelf: 'end'}}>{'\u2234'}</View>
      return (
        <React.Fragment key={proposition.key}>
          {therefore}
          <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>{proposition.index}</View>
          <View columnEnd={-2}>{proposition.content}</View>
        </React.Fragment>
      )
    })
  }

  const dividerStyle = argumentInputInvalid ? {borderColor: 'red'} : undefined
  const postSentence = (
    <React.Fragment>
      {propositionElements}
      <View style={{paddingBottom: '10px'}} columnSpan={4} />
    </React.Fragment>
  )

  return (
    <React.Fragment>
      <SentenceMeta sentence={argument} mode={mode} section={section} />
      <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>
        {isArguments ? toAlphaIndex(argument.index) : argument.index}
      </View>
      <View columnStart={3}>
        <Editor
          editorState={editorState} onChange={handleChange}
          keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} onFocus={handleFocus}
          readOnly={readOnly} ref={editorRef}
          placeholder={placeholder}
        />
        <Divider style={dividerStyle} />
      </View>
      {postSentence}
    </React.Fragment>
  )
}
