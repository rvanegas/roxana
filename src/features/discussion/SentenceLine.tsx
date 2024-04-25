import React, {useRef, useState, useEffect, useContext, MutableRefObject} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Divider, View, Button} from '@aws-amplify/ui-react'
import {throttle, sortBy, keys} from 'lodash'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import classNames from 'classnames'
import {CurrentUserContext} from '../user/User'
import {toAlphaIndex, verticalPixelsBelowViewport} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {selectDiscussions, propositionIndexesFromArgument,
  discussionsSlice} from './discussionsSlice'
import {replaceSentenceAction, changeGoalSentenceAction, focusOnSentence,
  changeSentenceStatusAction, changeSentenceHiddenAction, isActionable} from './data'
import './discussion.css'

interface SentenceProps {
  section: Section
  sentence: Sentence
  position: number
  sentenceListRef: MutableRefObject<HTMLElement>
}

export function SentenceLine(props: SentenceProps) {
  const {section, sentence, position, sentenceListRef} = props
  const {unsetFocus, clearSentenceModal, setSentenceModal,
    clearArgumentView, setArgumentView} = discussionsSlice.actions
  const discussions = useSelector(selectDiscussions)
  const isArguments = section === 'arguments'
  const currentUser = useContext(CurrentUserContext) as unknown as {username}
  const username = currentUser?.username
  const propositionIndexes = section === 'arguments' ? propositionIndexesFromArgument(sentence) : []
  const editorContainerRef = useRef() as MutableRefObject<HTMLElement>
  const editorRef = useRef() as MutableRefObject<HTMLElement>
  const modalRef = useRef() as MutableRefObject<HTMLElement>
  const dispatch = useDispatch()
  const propositions = discussions.propositions
  const [displayPropositionIndexes, setDisplayPropositionIndexes] = useState(propositionIndexes)
  const [editorState, setEditorState] = useState(initialEditorState)
  const [argumentInputInvalid, setArgumentInputInvalid] = useState(false)
  const placeholder = position !== 0 || !currentUser ? null : (
    section === 'propositions' ?
      'Type a proposition. For example, "Socrates is a man".' :
      'Type a sequence of proposition numbers. For example, "1 2 3".'
  )
  const readOnly = !(username && isActionable.edit(sentence, username))
  const inSentenceModal = discussions.sentenceModal &&
    discussions.sentenceModal.section === section &&
    discussions.sentenceModal.position === position

  const [offsetHeight, setOffsetHeight] = useState<number>(0)

  let canonicalContent

  useEffect(() => {
    if (sentence.autoFocus) {
      editorRef.current.focus()
      dispatch(unsetFocus({section, position}))
    }
    const offsetHeightRaw = editorContainerRef?.current?.offsetHeight
    if (offsetHeightRaw !== undefined && offsetHeight === 0) {
      setOffsetHeight(offsetHeightRaw)
    }

    if (inSentenceModal && modalRef) {
      let pixelsBelow = verticalPixelsBelowViewport(modalRef.current)
      if (pixelsBelow > 0) {
        sentenceListRef.current.scrollBy(0, pixelsBelow)
      }

      const throttledHandleResize = throttle(function handleResize() {
        const offsetHeightRaw = editorContainerRef?.current?.offsetHeight
        setOffsetHeight(offsetHeightRaw)
      }, 20)

      window.addEventListener('resize', throttledHandleResize)
      return () => {
        window.removeEventListener('resize', throttledHandleResize)
      }
    }
  }, [
    sentence, dispatch, editorRef, position, section, offsetHeight,
    inSentenceModal, unsetFocus, modalRef, sentenceListRef, editorContainerRef,
  ])

  if (discussions.showHidden && sentence.hidden && !inSentenceModal) {
    return null
  }

  function initialEditorState() {
    const contentState = ContentState.createFromText(sentence.content)
    return EditorState.createWithContent(contentState)
  }

  function setDisplayFromArgumentInput(argumentInput) {
    const invalidPattern = /[^\d\s]/
    const separatorPattern = /\s+/

    if (invalidPattern.test(argumentInput)) {
      // console.warn('invalid pattern, syntax')
      setArgumentInputInvalid(true)
      return
    }
    const indexes = argumentInput.split(separatorPattern)
      .map(index => parseInt(index)).filter(Number.isInteger)
    if (indexes.length !== (new Set(indexes)).size) {
      // console.warn('invalid pattern, numbers')
      setArgumentInputInvalid(true)
      return
    }
    const displayPropositions = indexes.map(i => propositions[i-1])
    if (displayPropositions.indexOf(undefined) !== -1) {
      // console.warn('invalid pattern, references')
      setArgumentInputInvalid(true)
      return
    }
    if (displayPropositions.some(p => p.status !== 'committed')) {
      // console.warn('invalid pattern, uncommitted', displayPropositions)
      setArgumentInputInvalid(true)
      return
    }
    setArgumentInputInvalid(false)
    setDisplayPropositionIndexes(indexes)
  }

  function handleChange(editorState) {
    const offsetHeightRaw = editorContainerRef?.current?.offsetHeight
    if (canonicalContent !== undefined) {
      const contentState = ContentState.createFromText(canonicalContent)
      setEditorState(EditorState.createWithContent(contentState))
      setArgumentInputInvalid(false)
    }
    else if (section === 'arguments') {
      const argumentInput = editorState.getCurrentContent().getPlainText()
      setDisplayFromArgumentInput(argumentInput)
      setEditorState(editorState)
      setOffsetHeight(offsetHeightRaw)
    }
    else {
      setEditorState(editorState)
      setOffsetHeight(offsetHeightRaw)
    }
  }

  function handleFocus() {
    dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'edit'}))
  }

  function setFinalContent() {
    if (canonicalContent !== undefined) {
      return canonicalContent
    }
    else if (section === 'arguments') {
      const content = displayPropositionIndexes.join(' ')
      if (editorState.getCurrentContent().getPlainText() !== sentence.content) {
        canonicalContent = content
      }
      return content
    }
    else {
      return editorState.getCurrentContent().getPlainText()
    }
  }

  function handleBlur() {
    const content = setFinalContent()
    const input = {key: sentence.key, section, content}
    dispatch(replaceSentenceAction(input))
  }

  function handleStatusToggle() {
    if (sentence.status !== 'committed') {
      return
    }
    if (sentence.accepted.includes(username)) {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'reject'}))
    }
    else if (sentence.rejected.includes(username)) {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'clear'}))
    }
    else {
      dispatch(changeSentenceStatusAction({key: sentence.key, section, change: 'accept'}))
    }
  }

  function handleGoalSet(e) {
    e.target.blur()
    if (sentence.status !== 'committed' || section !== 'propositions') {
      return
    }
    dispatch(changeGoalSentenceAction(position))
  }

  function handleSetHidden(e) {
    e.target.blur()
    const hidden = !sentence.hidden
    dispatch(changeSentenceHiddenAction({section, position, hidden}))
  }

  function handleIndex() {
    if (offsetHeight !== 0) {
      if (!username) {
        return
      }
      else if (inSentenceModal) {
        dispatch(clearSentenceModal())
      }
      else {
        dispatch(setSentenceModal({section, position}))
      }
    }
  }

  function handleInArgument() {
    const isSettable = discussions.argumentView === undefined ||
      discussions.argumentView.primaryPropositionPosition !== position
    isSettable ? dispatch(setArgumentView(position)) : dispatch(clearArgumentView())
  }

  function handleOverlay() {
    dispatch(clearSentenceModal())
  }

  function myKeyBindingFn(e) {
    if (e.keyCode === 13) {
      return e.shiftKey ? 'next-line' : 'blur-line'
    }
    if (e.keyCode === 27) {
      return 'escape'
    }
    return getDefaultKeyBinding(e)
  }

  function handleKeyCommand(command) {
    if (command === 'next-line' || command === 'blur-line') {
      editorRef.current.blur()
      if (command === 'next-line') {
        dispatch(focusOnSentence(section, position + 1))
      }
      return 'handled'
    } else if (command === 'escape') {
      canonicalContent = sentence.content
      setDisplayFromArgumentInput(canonicalContent)
      editorRef.current.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  function annotationIcons() {

    function claimsSummary() {
      const accepted = sentence.accepted.filter(d => !discussions.hideDiscussants[d])
      const rejected = sentence.rejected.filter(d => !discussions.hideDiscussants[d])
      if (accepted.length > 0 && rejected.length > 0) {
        return [true, false]
      }
      else if (accepted.length > 1) {
        return [true, true]
      }
      else if (rejected.length > 1) {
        return [false, false]
      }
      else if (accepted.length === 1) {
        return [true]
      }
      else if (rejected.length === 1) {
        return [false]
      }
      else {
        return []
      }
    }

    const userClaim = sentence.accepted.includes(username) ? true
      : sentence.rejected.includes(username) ? false : null
    let underlined
    const annotations = claimsSummary().map((claim, index) => {
      const underline = !underlined && claim === userClaim && !discussions.hideDiscussants[username]
      underlined = underlined || underline
      let style = {
        color: (claim ? 'seagreen' : 'firebrick'),
        borderBottom: underline ? '1px gray solid' : 'none'
      }
      return claim ?
        <span key={index} className="oi sentence-icon" style={style} data-glyph="check" /> :
        <span key={index} className="oi sentence-icon" style={style} data-glyph="x" />
    })
    const irrational = sentence.irrational.filter(d => !discussions.hideDiscussants[d])
    if (irrational.length !== 0) {
      let underline = irrational.includes(username) && !discussions.hideDiscussants[username]
      let style = {
        color: 'gold',
        borderBottom: underline ? '1px gray solid' : 'none'
      }
      annotations.unshift(<span key="i" className="oi sentence-icon" style={style} data-glyph="warning" />)
    }

    const annotationIconsClassName = classNames(
      'sentence-line-cell', 'sentence-meta', {
        'sentence-line-cell-in-modal': inSentenceModal,
        'sentence-hidden': sentence.hidden,
      }
    )

    return (
      <View
        columnStart={1} className={annotationIconsClassName}
        onClick={username ? handleStatusToggle : null}
      >
        <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
        <View style={{textAlign: 'right'}}>
          {annotations}
        </View>
      </View>
    )
  }

  function indexElement() {
    const goal = sentence.goal.filter(d => !discussions.hideDiscussants[d])
    const indexStyle = {
      border: goal.includes(username) ? '1px royalblue solid' :
        goal.length !== 0 ? '1px royalblue dashed' :
          '1px transparent solid',
      color: section === 'propositions' &&
        discussions.argumentView?.primaryPropositionPosition === position ? '#b00010' : 'black',
    }
    const indexClassName = classNames(
      'sentence-line-cell', 'sentence-index', {
        'sentence-line-cell-in-modal': inSentenceModal,
        'sentence-hidden': sentence.hidden,
      }
    )
    return (
      <View
        columnStart={2} className={indexClassName} style={indexStyle}
        onClick={handleIndex}
      >
        <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
        <View style={{textAlign: 'right'}}>
          {isArguments ? toAlphaIndex(position) : position + 1}
        </View>
      </View>
    )
  }

  function editorLine() {
    const editorElement = (
      <Editor
        editorState={editorState} onChange={handleChange}
        keyBindingFn={myKeyBindingFn} handleKeyCommand={handleKeyCommand}
        onBlur={handleBlur} onFocus={handleFocus}
        readOnly={readOnly} ref={editorRef}
        placeholder={placeholder}
      />
    )
    const editingStatus = (
      <div className={'discussion-actions'}>
        ...{sentence.owner} editing
      </div>
    )
    const editorClassName = classNames({
      'discussion-editor': true,
      'discussion-editor-draft': sentence.status === 'draft' && sentence.owner === username
    })
    const anothersDraft = sentence.status === 'draft' && sentence.owner !== username
    const editorLineClassName = classNames(
      'sentence-line-cell', {
        'sentence-line-cell-in-modal': inSentenceModal,
        'sentence-hidden': sentence.hidden,
      }
    )
    const dividerStyle = argumentInputInvalid ? {borderColor: 'red'} : undefined
    const editorContainer = (
      <View ref={editorContainerRef} className={editorClassName}>
        {editorElement}
        {anothersDraft ? editingStatus : undefined}
        <Divider style={dividerStyle} />
      </View>
    )
    return (
      <View columnStart={3} className={editorLineClassName}>
        {editorContainer}
      </View>
    )
  }

  function inArgumentElement() {
    const classes = classNames(
      'sentence-line-cell', 'sentence-in-argument', {
        'sentence-hidden': sentence.hidden,
      }
    )
    if (!sentence.inArgument) {
      return null
    }
    else {
      const arrowColor = discussions.argumentView?.primaryPropositionPosition === position ? '#ff0010' : 'gray'
      return (
        <View columnStart={4} className={classes} onClick={handleInArgument}>
          <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
          <View style={{textAlign: 'left'}}>
            <span key="a" className="oi sentence-icon" style={{color: arrowColor}} data-glyph="arrow-thick-right" />
          </View>
        </View>
      )
    }
  }

  function sentenceModal() {

    function modalAnnotations() {
      const commitments: {[key: string]: string} = {}
      for (let name of sentence.accepted) {
        commitments[name] = 'accepted'
      }
      for (let name of sentence.rejected) {
        commitments[name] = 'rejected'
      }
      for (let name of sentence.cleared) {
        commitments[name] = 'cleared'
      }
      const glyphs = {
        accepted: 'check',
        rejected: 'x',
        cleared: 'minus',
      }
      const colors = {
        accepted: 'seagreen',
        rejected: 'firebrick',
        cleared: 'gray',
      }
      const elements = sortBy(keys(commitments)).map((name, index) =>
        <View key={`c${index}`}>
          <span
            className="oi sentence-icon"
            style={{color: colors[commitments[name]], paddingRight: '10px'}}
            data-glyph={glyphs[commitments[name]]}
          />
          {name}
        </View>
      )
      elements.unshift(...sortBy(sentence.goal).map((name, index) =>
        <View key={`g${index}`}>
          <span
            className="oi sentence-icon"
            style={{color: 'royalblue', paddingRight: '10px'}}
            data-glyph="bookmark"
          />
          {name}
        </View>
      ))
      return elements
    }

    const sentenceModalStyle = {
      top: `${-offsetHeight - 23}px`,
      paddingTop: `${offsetHeight + 30}px`,
      paddingBottom: '5px',
    }
    const modalActions = [
      <Button key="h" variation="link" size="small" onClick={e => handleSetHidden(e)}>
        {sentence.hidden ? 'unhide' : 'hide'}
      </Button>
    ]
    if (section === 'propositions') {
      modalActions.push(
        <Button key="g" variation="link" size="small" onClick={e => handleGoalSet(e)}>
          {sentence.goal.includes(username) ? 'clear goal' : 'set goal'}
        </Button>
      )
    }
    return !inSentenceModal ? undefined : (
      <View columnStart={1} columnEnd={4} className="sentence-modal-wrapper">
        <View ref={modalRef} className="sentence-modal" style={sentenceModalStyle}>
          <View style={{paddingLeft: '52px', paddingBottom: '10px'}}>
            {modalAnnotations()}
          </View>
          <View style={{paddingLeft: '50px'}}>{modalActions}</View>
        </View>
        <View
          className="sentence-modal-overlay"
          onClick={handleOverlay}
        />
      </View>
    )
  }

  function postSentence() {
    if (section === 'propositions') {
      return null
    }
    const sentenceMetaClassName = classNames(
      'sentence-line-cell', 'sentence-meta', {
        'sentence-hidden': sentence.hidden,
      }
    )
    const sentenceIndexClassName = classNames(
      'sentence-line-cell', 'sentence-index', {
        'sentence-hidden': sentence.hidden,
      }
    )
    const sentenceEditorClassName = classNames(
      'sentence-line-cell', {
        'sentence-hidden': sentence.hidden,
      }
    )
    const steps = displayPropositionIndexes.map((index, mapIndex) => {
      const proposition = propositions[index-1]
      const therefore = (mapIndex !== displayPropositionIndexes.length - 1) ? null :
        <View columnStart={1} className={sentenceMetaClassName}>
          <View style={{textAlign: 'right', fontSize: 'larger', lineHeight: '10px'}}>
            {'\u2234'}
          </View>
        </View>
      return (
        <React.Fragment key={proposition.key}>
          {therefore}
          <View columnStart={2} className={sentenceIndexClassName}>
            <View style={{textAlign: 'right'}}>{index}</View>
          </View>
          <View columnEnd={-2} className={sentenceEditorClassName}>{proposition.content}</View>
        </React.Fragment>
      )
    })
    const isLastArgument = discussions.arguments.length - 1 === position
    const padding = isLastArgument ? undefined :
      <View style={{paddingBottom: '10px'}} columnSpan={4} />
    return (
      <React.Fragment>
        {steps}
        {padding}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      {annotationIcons()}
      {indexElement()}
      {editorLine()}
      {inArgumentElement()}
      {sentenceModal()}
      {postSentence()}
    </React.Fragment>
  )
}
