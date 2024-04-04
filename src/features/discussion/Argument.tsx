import React, {useState, useEffect, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {SentenceMeta} from './SentenceMeta'
import {Section, ElementRef} from './discussion.d'
import {
  selectDiscussions,
  propositionIndexesFromArgument,
  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
  changeSentenceStatusAction,
  ReplaceSentenceInput,
  sentenceCommittedOthers,
} from './discussionsSlice'
import './discussion.css'

export function Argument({position, argument, discussionId}) {
  let canonicalContent
  const sentence = argument
  const section: Section = 'arguments'

  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  // @ts-ignore
  const propositionIndexes = section === 'arguments' && propositionIndexesFromArgument(sentence)
  const editorRef = React.createRef() as ElementRef
  const dispatch = useDispatch()
  const discussions = useSelector(selectDiscussions)
  const propositions = discussions.propositions
  // @ts-ignore
  const [displayPropositionIndexes, setDisplayPropositionIndexes] = useState(section === 'arguments' && propositionIndexes)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [argumentInputInvalid, setArgumentInputInvalid] = useState(false)
  const placeholder = position !== 0 ? null : (
    // @ts-ignore
    section === 'propositions' ?
      'Type a proposition. For example, "Socrates is a man."' :
      'Type a sequence of proposition numbers. For example, "1 2 3".'
  )
  const readOnly = !username || sentenceCommittedOthers(sentence, username) || sentence.inArgument

  function initialEditorState() {
    const contentState = ContentState.createFromText(sentence.content)
    return EditorState.createWithContent(contentState)
  }

  //////////////////

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
    if (section === 'arguments') {
      const argumentInput = editorState.getCurrentContent().getPlainText()
      setDisplayFromArgumentInput(argumentInput)
    }
    if (section === 'arguments' && canonicalContent !== undefined) {
      const contentState = ContentState.createFromText(canonicalContent)
      setEditorState(EditorState.createWithContent(contentState))
      setArgumentInputInvalid(false)
    }
    else {
      setEditorState(editorState)
    }
  }

  function setFinalContent() {
    if (section === 'arguments') {
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

  function handleFocus() {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'edit'}))
  }

  function handleBlur() {
    const content = setFinalContent()
    if (content !== sentence.content || sentence.status === 'draft') {
      const input: ReplaceSentenceInput = {key: sentence.key, section, content}
      dispatch(replaceSentenceAction(input))
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
        dispatch(focusOnSentence(section, position + 1))
      }
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

  return (
    <React.Fragment>
      <SentenceMeta
        sentence={sentence} position={position} section={section}
        postSentence={postSentence} dividerStyle={dividerStyle} editorElement={editorElement}
      />
    </React.Fragment>
  )
}
