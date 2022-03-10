import React, {useState, useEffect, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider, Text} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {CurrentUserContext} from '../user/User'
import {SentenceMeta} from './SentenceMeta'
import {
  unsetFocus,
  focusOnSentence,
  replaceSentenceAction,
} from './discussionsSlice'

export function Proposition({position, discussionId, proposition}) {
  const dispatch = useDispatch()
  const editorRef = React.createRef() as {current: {blur(): void, focus(): void}}
  const [editorState, setEditorState] = useState(initEditorState)
  const placeholder = proposition.index === 1 ?
    'Type a proposition. For example, "Socrates is a man."' : null
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser.username
  const readOnly = proposition.status === 'draft' && proposition.owner !== username

  function initEditorState() {
    const contentState = ContentState.createFromText(proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    const content = editorState.getCurrentContent().getPlainText()
    if (proposition.content !== content) {
      dispatch(replaceSentenceAction({key: proposition.key, section: 'propositions', discussionId, content}))
    }
  }
  function myKeyBindingFn(e) {
    if (e.keyCode === 13) {
      return 'next-line'
    }
    return getDefaultKeyBinding(e)
  }
  function handleKeyCommand(command) {
    if (command === 'next-line') {
      editorRef.current.blur()
      dispatch(focusOnSentence('propositions', position + 1))
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
      <SentenceMeta sentence={proposition} />
      <View columnStart={2} style={{paddingRight: '10px', placeSelf: 'center end'}}>
        {proposition.index}
      </View>
      <View columnStart={3}>
        <Text color="lightgray">{gray}</Text>
        <Editor editorState={editorState} onChange={setEditorState}
          keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
          placeholder={placeholder}
        />
        <Divider/>
      </View>
    </React.Fragment>
  )
}
