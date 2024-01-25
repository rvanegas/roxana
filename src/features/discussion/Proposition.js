import React, { useState } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
import {
  View, Button, Divider
} from '@aws-amplify/ui-react'
import { Editor, EditorState, ContentState } from 'draft-js';

export function Proposition(props) {
  const [editorState, setEditorState] = useState(() => {
    const contentState = ContentState.createFromText(props.proposition.content)
    return EditorState.createWithContent(contentState)
  })
  const [readOnly, setReadOnly] = useState(false)
  function plainText() {
    return editorState.getCurrentContent().getPlainText()
  }
  function reset() {
    setEditorState(EditorState.createWithContent(editorState.getCurrentContent()))
  }

  return (
    <View>
      <Button onClick={() => {setReadOnly(!readOnly)}}>edit</Button>
      <Button onClick={() => {console.log(plainText())}}>text</Button>
      <Button onClick={() => {reset()}}>reset</Button>
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
