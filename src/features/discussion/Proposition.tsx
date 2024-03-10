import React, {useState, useEffect, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider, Text} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {SentenceMeta} from './SentenceMeta'
import {ElementRef, SentenceMode} from './discussion.d'
import {
  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
} from './discussionsSlice'

export function Proposition({position, discussionId, proposition}) {
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
      const value = {key: proposition.key, section: 'propositions', discussionId, content}
      // @ts-ignore
      dispatch(replaceSentenceAction(value)).then(() => setMode(''))
      setMode('saving')
    }
    else {
      setMode('')
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

  const gray = null // `${proposition.content} [${proposition.key}] [${proposition.id}]`
  return (
    <React.Fragment>
      <SentenceMeta sentence={proposition} mode={mode} />
      <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Text color="lightgray">{gray}</Text>
        <Editor editorState={editorState} onChange={setEditorState}
          keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} onFocus={handleFocus} readOnly={readOnly} ref={editorRef}
          placeholder={placeholder}
        />
        <Divider/>
      </View>
    </React.Fragment>
  )
}
