import React, { useState } from 'react'
import {
  View, Button, Divider
} from '@aws-amplify/ui-react'
import { Editor, EditorState } from 'draft-js';

export function Proposition() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [editorState2, setEditorState2] = useState(() => EditorState.createEmpty())
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
      <View>
        <Editor editorState={editorState} onChange={setEditorState} readOnly={readOnly} />
      </View>
      <Divider/>
      <View>
        <Editor editorState={editorState2} onChange={setEditorState2} readOnly={readOnly} />
      </View>
      <Divider/>
      <View>
        {JSON.stringify(editorState)}
        <Divider/>
        {JSON.stringify(editorState2)}
      </View>
      <Divider/>
    </View>
  )
}
