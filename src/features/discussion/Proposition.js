import React, {useState, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {updateProposition, focusOnProposition} from './propositionsSlice'

export function Proposition({proposition, readOnly}) {
  const dispatch = useDispatch()
  const editorRef = React.createRef()
  const [editorState, setEditorState] = useState(initEditorState)
  const [placeholder, setPlaceholder] = useState(
    proposition.index === 0 ?
    'Type a proposition. For example, "Socrates is a man."' : null
  )

  function initEditorState() {
    const contentState = ContentState.createFromText(proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    if (placeholder) {
      setPlaceholder(null)
    }
    const id = proposition.id
    const content = editorState.getCurrentContent().getPlainText()
    dispatch(updateProposition({id, content}))
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
      dispatch(focusOnProposition(proposition.index+1))
      return 'handled'
    }
    return 'not-handled'
  }
  useEffect(() => {
    if (proposition.autoFocus) {
      editorRef.current.focus()
      dispatch(updateProposition({id: proposition.id, autoFocus: false}))
    }
  })

  return (
    <View>
      <Editor editorState={editorState} onChange={setEditorState}
        keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
        onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
        placeholder={placeholder}
      />
      <Divider/>
    </View>
  )
}
