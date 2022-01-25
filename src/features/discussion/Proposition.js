import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { View, Divider } from '@aws-amplify/ui-react'
import { Editor, EditorState, ContentState } from 'draft-js';
import { updateProposition } from './propositionsSlice'

export function Proposition(props) {
  function initEditorState() {
    const contentState = ContentState.createFromText(props.proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    const id = props.proposition.id
    const content = editorState.getCurrentContent().getPlainText()
    dispatch(updateProposition({id, content}))
  }

  const [editorState, setEditorState] = useState(initEditorState)
  const dispatch = useDispatch()

  return (
    <View>
      <Editor editorState={editorState} onChange={setEditorState}
        onBlur={handleBlur} readOnly={props.readOnly}
      />
      <Divider/>
      {JSON.stringify(editorState).length}
      <Divider/>
    </View>
  )
}
