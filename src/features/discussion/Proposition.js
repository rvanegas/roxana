import React, {useState, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {View, Divider, Text} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {
  updateProposition,
  focusOnProposition,
  replacePropositionAction,
} from './discussionsSlice'

export function Proposition({discussionId, proposition, readOnly}) {
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
    const propositionId = proposition.id
    const content = editorState.getCurrentContent().getPlainText()
    // console.log('handle blur', propositionId)
    if (proposition.content !== content) {
      dispatch(replacePropositionAction({propositionId, discussionId, content}))
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
      // console.log('handle key', proposition.id)
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
      <Text color="lightgray">{proposition.content}</Text>
      <Editor editorState={editorState} onChange={setEditorState}
        keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
        onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
        placeholder={placeholder}
      />
      <Divider/>
    </View>
  )
}
