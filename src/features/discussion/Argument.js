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
  const [displayPropositionIds, setDisplayPropositionIds] = useState(argument.propositionIds)
  const [argumentCodeInvalid, setArgumentCodeInvalid] = useState(false)

  function initEditorState() {
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
    const contentState = ContentState.createFromText(argumentCode)
    return EditorState.createWithContent(contentState)
  }

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
    const foo = initEditorState()
    console.log('blur', {
      id,
      value: editorState.getCurrentContent().getPlainText(),
      foo: foo.getCurrentContent().getPlainText()
    })
    setEditorState(foo)
    // dispatch(updateProposition({id, content}))
  }

  function handleChange(value) {
    const content = value.getCurrentContent().getPlainText()
    parseArgumentCode(content)
    setEditorState(value)
  }

  console.log('d', displayPropositionIds)
  const numPremises = displayPropositionIds.length



  const conclusion = propositionById(displayPropositionIds[displayPropositionIds.length - 1])
  const conclusionElement = !Boolean(conclusion) ? null : (
    <React.Fragment key={conclusion.id}>
      <View style={{justifySelf: 'end'}}>:.</View>
      <View>{conclusion.index}</View>
      <View>{conclusion.content}</View>
    </React.Fragment>
  )

  const premises = displayPropositionIds.slice(0, displayPropositionIds.length - 1)
  const premiseElements = premises.length === 0 ? null : premises.map(premiseId => {
    const premise = propositionById(premiseId)
    return (
      <React.Fragment key={premise.id}>
        <View columnStart={2}>{premise.index}</View>
        <View>{premise.content}</View>
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
        <Divider style={{borderColor: argumentCodeInvalid ? 'red' : 'black'}}/>
      </View>
      {premiseElements}
      {conclusionElement}
    </React.Fragment>
  )
}
