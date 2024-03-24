import React, {useState, useEffect, useContext} from 'react'
import {useDispatch} from 'react-redux'

import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {SentenceMeta} from './SentenceMeta'
import {Section, SentenceMode, ElementRef} from './discussion.d'
import {


  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
  changeSentenceStatusAction,
  ReplaceSentenceInput,
} from './discussionsSlice'
import './discussion.css'

export function Proposition({position, discussionId, proposition}) {
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const section: Section = 'propositions'
  // @ts-ignore

  const editorRef = React.createRef() as ElementRef

  const dispatch = useDispatch()



  const [editorState, setEditorState] = useState(initEditorState)

  const placeholder = position === 0 ?
    'Type a proposition. For example, "Socrates is a man."' : null
  const readOnly = proposition.accepted.length + proposition.rejected.length > 0 || proposition.inArgument
  const [mode, setMode] = useState<SentenceMode>('')

  function initEditorState() {
    const content = proposition.status === 'draft' && proposition.owner !== username ? `${username} is thinking...` : proposition.content
    const contentState = ContentState.createFromText(content)
    return EditorState.createWithContent(contentState)
  }

  function handleFocus() {
    setMode('editing')
    dispatch(changeSentenceStatusAction({key: proposition.key, section, change: 'edit'}))
  }

  function handleBlur() {
    const content = editorState.getCurrentContent().getPlainText()
    if (proposition.content !== content || proposition.status === 'draft') {
      const input: ReplaceSentenceInput = {key: proposition.key, section: 'propositions', content}
      const response = dispatch(replaceSentenceAction(input)) as unknown as {then(any)}
      response.then(() => setMode(''))
      setMode('saving')
    }
    else {
      setMode('')
    }
  }

  function handleChange(editorState) {
    setEditorState(editorState)
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
        dispatch(focusOnSentence('propositions', position + 1))
      }
      return 'handled'
    }
    return 'not-handled'
  }

  useEffect(() => {
    if (proposition.autoFocus) {
      editorRef.current.focus()
      dispatch(unsetFocus({section: 'propositions', position}))
    }
  })

  const sentence = proposition

  ///////////////////

  const dividerStyle = undefined
  const postSentence = undefined

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
        sentence={sentence} position={position} mode={mode} section={section} readOnly={readOnly}
        postSentence={postSentence} dividerStyle={dividerStyle} editorElement={editorElement}
      />
    </React.Fragment>
  )
}
