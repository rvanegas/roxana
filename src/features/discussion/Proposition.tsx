import React, {useState, useEffect, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {toAlphaIndex} from '../../app/util'
import {SentenceMeta} from './SentenceMeta'
import {Section, SentenceMode, ElementRef} from './discussion.d'
import {
  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
  ReplaceSentenceInput,
} from './discussionsSlice'

export function Proposition({position, discussionId, proposition}) {
  const section: Section = 'propositions'
  // @ts-ignore
  const isArguments = section === 'arguments'
  const dispatch = useDispatch()
  const editorRef = React.createRef() as ElementRef
  const [editorState, setEditorState] = useState(initEditorState)
  const placeholder = proposition.index === 1 ?
    'Type a proposition. For example, "Socrates is a man."' : null
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const readOnly = proposition.status === 'draft' && proposition.owner !== username
  const [mode, setMode] = useState<SentenceMode>('')

  function initEditorState() {
    const contentState = ContentState.createFromText(proposition.content)
    return EditorState.createWithContent(contentState)
  }

  function handleFocus() {
    setMode('editing')
  }
  function handleBlur() {
    const content = editorState.getCurrentContent().getPlainText()
    if (proposition.content !== content) {
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

  ///////////////////

  const dividerStyle = undefined
  const postSentence = undefined

  return (
    <React.Fragment>
      <SentenceMeta sentence={proposition} mode={mode} section={section} />
      <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>
        {isArguments ? toAlphaIndex(proposition.index) : proposition.index}
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
