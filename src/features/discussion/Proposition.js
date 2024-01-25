import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { View, Divider } from '@aws-amplify/ui-react'
import { Editor, EditorState, ContentState } from 'draft-js';
import { updateProposition } from './propositionsSlice'

export function Proposition({proposition, readOnly}) {
  function initEditorState() {
    const contentState = ContentState.createFromText(proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    const id = proposition.id
    const content = editorState.getCurrentContent().getPlainText()
    dispatch(updateProposition({id, content}))
  }

  const [editorState, setEditorState] = useState(initEditorState)
  const dispatch = useDispatch()

  return (
    <View>
      {proposition.position}
      <Editor editorState={editorState} onChange={setEditorState}
        onBlur={handleBlur} readOnly={readOnly}
      />
      <Divider/>
    </View>
  )
}
