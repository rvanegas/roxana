import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import {selectPropositions} from './propositionsSlice'

export function Argument({argument, readOnly}) {
  const propositions = useSelector(selectPropositions)
  const propositionById = id => propositions.find(proposition => proposition.id === id)
  const propositionByIndex = index => propositions.find(proposition => proposition.index === index)

  const editorRef = React.createRef()
  const [editorState, setEditorState] = useState(initEditorState)
  const [displayPremiseIds, setDisplayPremiseIds] = useState(argument.premiseIds)
  const [displayConclusionId, setDisplayConclusionId] = useState(argument.conclusionId)
  const [argumentCodeInvalid, setArgumentCodeInvalid] = useState(false)

  function initEditorState() {
    const premises = argument.premiseIds.map(premiseId => propositionById(premiseId))
    const premiseIndexes = premises.map(proposition => proposition.index).join(', ')
    const conclusionIndex = propositionById(argument.conclusionId).index
    const argumentCode = `${premiseIndexes}: ${conclusionIndex}`
    const contentState = ContentState.createFromText(argumentCode)
    return EditorState.createWithContent(contentState)
  }

  function parseArgumentCode(argumentCode) {
    // console.log('ac', argumentCode)
    const invalidPattern = /[^\d\s,:]/
    const separatorPattern = /[\s,:]+/

    if (invalidPattern.test(argumentCode)) {
      // console.log('invalid', argumentCode)
      setArgumentCodeInvalid(true)
      return
    }

    const displayPropositionIndexes = argumentCode.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    // console.log('indexes', displayPropositionIndexes)

    if (displayPropositionIndexes.length !== (new Set(displayPropositionIndexes)).size) {
      setArgumentCodeInvalid(true)
      return
    }

    const displayPropositions = displayPropositionIndexes.map(propositionByIndex)
    if (displayPropositions.indexOf(undefined) !== -1) {
      // console.log('d', displayPropositions)
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositionIds = displayPropositions.map(displayProposition => displayProposition.id)
    setArgumentCodeInvalid(false)
    setDisplayConclusionId(displayPropositionIds.pop())
    setDisplayPremiseIds(displayPropositionIds)
  }

  function handleBlur() {
    const id = argument.id
    const content = editorState.getCurrentContent().getPlainText()
    console.log('blur', {id, content})
    // dispatch(updateProposition({id, content}))
  }

  function handleChange(value) {
    const content = value.getCurrentContent().getPlainText()
    console.log('change')
    parseArgumentCode(content)
    setEditorState(value)
  }


  const premiseElements = displayPremiseIds.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.id}>
        <View columnStart={2}>{premise.index}</View>
        <View>{premise.content}</View>
      </React.Fragment>
    )
  })
  const conclusion = propositionById(displayConclusionId)
  const conclusionElement = (
    <React.Fragment key={conclusion.id}>
      <View style={{justifySelf: 'end'}}>:.</View>
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
        <Editor editorState={editorState} onChange={handleChange}
          // keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
          onBlur={handleBlur} readOnly={readOnly} ref={editorRef}
        />
        <Divider style={{borderColor: argumentCodeInvalid ? 'red' : 'black'}}/>
      </View>
      {premiseElements}
      {conclusionElement}
    </React.Fragment>
  )
}
