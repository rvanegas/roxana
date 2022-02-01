import React, {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Divider, View} from '@aws-amplify/ui-react'
import {Editor, EditorState, ContentState} from 'draft-js'
import {selectPropositions} from './propositionsSlice'
import {updateArgument} from './argumentsSlice'

export function Argument({argument, readOnly}) {
  const propositions = useSelector(selectPropositions)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [displayPropositionIds, setDisplayPropositionIds] = useState(argument.propositionIds)
  const [argumentCodeInvalid, setArgumentCodeInvalid] = useState(false)
  const dispatch = useDispatch()
  const editorRef = React.createRef()

  const propositionById = id => propositions.find(proposition => proposition.id === id)
  const propositionByIndex = index => propositions.find(proposition => proposition.index === index)

  function buildArgumentCode() {
    const argumentPropositions = argument.propositionIds
      .map(propositionId => propositionById(propositionId))
    let argumentCode = ''
    if (argumentPropositions.length !== 0) {
      const conclusionIndex = argumentPropositions.pop().index
      argumentCode = `:${conclusionIndex}`
    }
    if (argumentPropositions.length !== 0) {
      const premiseIndexes = argumentPropositions
        .map(proposition => proposition.index).join(' ')
      argumentCode = `${premiseIndexes} ${argumentCode}`
    }
    return argumentCode
  }

  function initialEditorState() {
    const contentState = ContentState.createFromText(buildArgumentCode())
    return EditorState.createWithContent(contentState)
  }

  // parse, validate, and display propositions
  function parseArgumentCode(argumentCode) {
    const invalidPattern = /[^\d\s:]/
    const separatorPattern = /[\s:]+/

    if (invalidPattern.test(argumentCode)) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositionIndexes = argumentCode.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    if (displayPropositionIndexes.length !== (new Set(displayPropositionIndexes)).size) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositions = displayPropositionIndexes.map(propositionByIndex)
    if (displayPropositions.indexOf(undefined) !== -1) {
      setArgumentCodeInvalid(true)
      return
    }
    const displayPropositionIds = displayPropositions
      .map(displayProposition => displayProposition.id)
    setArgumentCodeInvalid(false)
    setDisplayPropositionIds(displayPropositionIds)
  }

  function handleBlur() {
    const id = argument.id
    const propositionIds = displayPropositionIds
    dispatch(updateArgument({id, propositionIds}))
  }

  function handleChange(value) {
    const argumentCode = value.getCurrentContent().getPlainText()
    parseArgumentCode(argumentCode)
    setEditorState(value)
  }

  // set canonical argumentCode
  if (!editorState.getSelection().getHasFocus()) {
    const argumentCode = buildArgumentCode()
    if (editorState.getCurrentContent().getPlainText() !== argumentCode) {
      const contentState = ContentState.createFromText(argumentCode)
      setEditorState(EditorState.createWithContent(contentState))
    }
  }

  const conclusion = propositionById(displayPropositionIds[displayPropositionIds.length - 1])
  const conclusionElement = !Boolean(conclusion) ? null : (
    <React.Fragment key={conclusion.id}>
      <View columnStart={1} style={{justifySelf: 'end'}}>:.</View>
      <View>{conclusion.index}</View>
      <View columnEnd={-2}>{conclusion.content}</View>
    </React.Fragment>
  )

  const premises = displayPropositionIds.slice(0, displayPropositionIds.length - 1)
  const premiseElements = premises.length === 0 ? null : premises.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.id}>
        <View columnStart={2}>{premise.index}</View>
        <View columnEnd={-2}>{premise.content}</View>
      </React.Fragment>
    )
  })

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
        <Divider style={argumentCodeInvalid ? {borderColor: 'red'} : null}/>
      </View>
      {premiseElements}
      {conclusionElement}
    </React.Fragment>
  )
}
