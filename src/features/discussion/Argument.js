import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {selectPropositions} from './propositionsSlice'

export function Argument({argument, readOnly}) {
  const [argumentCode, setArgumentCode] = useState('')
  const propositions = useSelector(selectPropositions)
  const propositionById = id => propositions.find(proposition => proposition.id === id)

  const editorRef = React.createRef()
  const [editorState, setEditorState] = useState(initEditorState)

  function initEditorState() {
    const contentState = ContentState.createFromText(argumentCode)
    return EditorState.createWithContent(contentState)
  }
  function handleBlur() {
    const id = argument.id
    const content = editorState.getCurrentContent().getPlainText()
    console.log('blur', {id, content})
    // dispatch(updateProposition({id, content}))
  }

  const premiseElements = argument.premiseIds.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.id}>
        <View columnStart={2}>{premise.index}</View>
        <View>{premise.content}</View>
      </React.Fragment>
    )
  })
  const conclusion = propositionById(argument.conclusionId)
  const conclusionElement = (
    <React.Fragment key={conclusion.id}>
      <View style={{'justify-self': 'end'}}>:.</View>
      <View>{conclusion.index}</View>
      <View>{conclusion.content}</View>
    </React.Fragment>
  )
  return (
    <React.Fragment key={argument.id}>
      <View columnStart={2}>
        {argument.index}
      </View>
      <View>
        <Editor editorState={editorState} onChange={setEditorState}
          // keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
        />
        <Divider/>
      </View>
      {premiseElements}
      {conclusionElement}
    </React.Fragment>
  )
}
