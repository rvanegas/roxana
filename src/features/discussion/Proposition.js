import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { View, Button, Divider } from '@aws-amplify/ui-react'
import { Editor, EditorState, ContentState } from 'draft-js';
import { updateProposition } from './propositionsSlice'

export function Proposition(props) {
  function initEditorState() {
    const contentState = ContentState.createFromText(props.proposition.content)
    return EditorState.createWithContent(contentState)
  }
  function plainText() {
    return editorState.getCurrentContent().getPlainText()
  }
  function reset() {
    setEditorState(EditorState.createWithContent(editorState.getCurrentContent()))
  }
  function handleUpdate() {
    const id = props.proposition.id
    const content = plainText()
    dispatch(updateProposition({id, content}))
  }

  const [editorState, setEditorState] = useState(initEditorState)
  const [readOnly, setReadOnly] = useState(false)
  const dispatch = useDispatch()

  return (
    <View>
      <Button onClick={() => setReadOnly(!readOnly)}>edit</Button>
      <Button onClick={() => console.log(plainText())}>text</Button>
      <Button onClick={() => reset()}>reset</Button>
      <Button onClick={() => handleUpdate()}>dispatch</Button>
      <Divider/>
      [{readOnly ? '1' : '0'}]
      <Divider/>
      <Editor editorState={editorState} onChange={setEditorState} readOnly={readOnly} />
      <Divider/>
      {JSON.stringify(editorState)}
      <Divider/>
    </View>
  )
}
