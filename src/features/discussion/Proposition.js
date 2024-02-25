import React, {useState, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider, Text} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {
  updateSentence,
  focusOnSentence,
  replaceSentenceAction,
} from './discussionsSlice'

export function Proposition({position, discussionId, proposition, readOnly}) {
  const dispatch = useDispatch()
  const editorRef = React.createRef()
  const [editorState, setEditorState] = useState(initEditorState)
  const [placeholder, setPlaceholder] = useState(() => proposition.index === 0 ?
    'Type a proposition. For example, "Socrates is a man."' : null
  )

  function initEditorState() {
    const contentState = ContentState.createFromText(proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    const content = editorState.getCurrentContent().getPlainText()
    if (proposition.content !== content) {
      dispatch(replaceSentenceAction({key: proposition.key, section: 'propositions', discussionId, content}))
    }
    if (placeholder && Boolean(content)) {
      setPlaceholder(null)
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
      // console.log('useEffect', proposition)
      editorRef.current.focus()
      dispatch(updateSentence({section: 'propositions', newSentence: {key: proposition.key, autoFocus: false}}))
    }
  })

  const gray = `${proposition.content} [${proposition.key}] [${proposition.id}]`
  return (
    <View>
      <Text color="lightgray">{gray}</Text>
      <Editor editorState={editorState} onChange={setEditorState}
        keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
        onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
        placeholder={placeholder}
      />
      <Divider/>
    </View>
  )
}
