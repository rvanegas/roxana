import React, {Fragment, useRef, useState, useEffect, useContext, useCallback,
  MutableRefObject} from 'react'
import {createPortal} from 'react-dom'
import {useSelector, useDispatch} from 'react-redux'
import {AppDispatch} from '../../app/store'
import {Divider, View, Button} from '@aws-amplify/ui-react'
import {throttle, sortBy, keys} from 'lodash'
import {Editor, EditorState, ContentState, getDefaultKeyBinding} from 'draft-js'
import classNames from 'classnames'
import {CurrentUserContext} from '../user/User'
import {toAlphaIndex, verticalPixelsBelowViewport} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {selectDiscussions, propositionIndexesFromArgument,
  forcedPropositionPositions, discussionsSlice} from './discussionsSlice'
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
  const {clearSentenceModal, setSentenceModal,
    clearArgumentView, setArgumentView, setArgumentViewFromArgument,
    toggleSelectProposition, toggleSelectArgument} = discussionsSlice.actions
  const unsetFocus = useCallback(discussionsSlice.actions.unsetFocus, [section, position])
  const discussions = useSelector(selectDiscussions)
  const isArguments = section === 'arguments'
  const {user} = useContext(CurrentUserContext) as unknown as {user, route}
  const username = user?.username
  const propositionIndexes = section === 'arguments' ? propositionIndexesFromArgument(sentence) : []
  const editorContainerRef = useRef() as MutableRefObject<HTMLDivElement>
  const editorRef = useRef() as MutableRefObject<HTMLElement>
  const modalRef = useRef() as MutableRefObject<HTMLDivElement>
  const dispatch = useDispatch<AppDispatch>()
  const propositions = discussions.propositions
  const [displayPropositionIndexes, setDisplayPropositionIndexes] = useState(propositionIndexes)
  const [editorState, setEditorState] = useState(setEditorStateFromProp)
  const [argumentInputInvalid, setArgumentInputInvalid] = useState(false)
  const placeholder = position !== 0 || !username ? null : (
    section === 'propositions' ?
      'Type a proposition. For example, "Socrates is a man".' :
      'Type a sequence of proposition numbers. For example, "1 2 3".'
  )
  const readOnly = discussions.selectMode || !(username && isActionable.edit(sentence, username))
  const inSentenceModal = discussions.sentenceModal &&
    discussions.sentenceModal.section === section &&
    discussions.sentenceModal.position === position
  const [offsetHeight, setOffsetHeight] = useState<number>(0)
  let canonicalContent

  function setEditorStateFromProp() {
    const contentState = ContentState.createFromText(sentence.content)
    return EditorState.createWithContent(contentState)
  }

  useEffect(() => {
    if (sentence.autoFocus) {
      editorRef.current.focus()
      dispatch(unsetFocus({section, position}))
    }
  }, [dispatch, editorRef, unsetFocus, sentence.autoFocus, section, position])

  useEffect(() => {
    const offsetHeightRaw = editorContainerRef?.current?.offsetHeight
    if (offsetHeightRaw !== undefined && offsetHeight === 0) {
      setOffsetHeight(offsetHeightRaw)
    }
  }, [setOffsetHeight, editorContainerRef, offsetHeight])

  useEffect(() => {
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
    sentence, dispatch, editorRef, position, section, editorContainerRef,
    inSentenceModal, modalRef, sentenceListRef
  ])

  if (discussions.showHidden && sentence.hidden && !inSentenceModal) {
    return null
  }

  function highlightColor(section, position, defaultColor = 'black') {
    return section === 'propositions' &&
      discussions.argumentView?.primaryPropositionPosition === position ? '#0099ff' : defaultColor
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
    dispatch(changeSentenceStatusAction({section, position, change: 'edit'}))
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
    const input = {section, position, content}
    dispatch(replaceSentenceAction(input))
  }

  function handleStatusToggle() {
    if (isActionable.reject(sentence, username)) {
      dispatch(changeSentenceStatusAction({section, position, change: 'reject'}))
    }
    else if (isActionable.clear(sentence, username)) {
      dispatch(changeSentenceStatusAction({section, position, change: 'clear'}))
    }
    else if (isActionable.accept(sentence, username)) {
      dispatch(changeSentenceStatusAction({section, position, change: 'accept'}))
    }
    else {
      console.log('no action')
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
      if (inSentenceModal) {
        dispatch(clearSentenceModal())
      }
      else {
        dispatch(setSentenceModal({section, position}))
      }
    }
  }

  function handleSelectToggle() {
    const action = isArguments ? toggleSelectArgument : toggleSelectProposition
    dispatch(action(position))
  }

  function handleInArgument() {
    const isSettable = discussions.argumentView === undefined ||
      discussions.argumentView.primaryPropositionPosition !== position
    isSettable ? dispatch(setArgumentView(position)) : dispatch(clearArgumentView())
  }

  function handleFromArgument() {
    const isSettable = discussions.argumentView === undefined ||
      discussions.argumentView.primaryArgumentPosition !== position
    isSettable ? dispatch(setArgumentViewFromArgument(position)) : dispatch(clearArgumentView())
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

    let checkbox = null
    if (discussions.selectMode) {
      const forced = forcedPropositionPositions(discussions)
      let checked, disabled
      if (isArguments) {
        checked = discussions.selectedArguments.includes(position)
        disabled = false
      } else {
        const isForced = forced.has(position)
        checked = isForced || discussions.selectedPropositions.includes(position)
        disabled = isForced
      }
      checkbox = (
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          readOnly
          style={{cursor: disabled ? 'default' : 'pointer', marginRight: '4px', flexShrink: 0}}
        />
      )
    }

    return (
      <View
        columnStart={1} className={annotationIconsClassName}
        onClick={discussions.selectMode ? handleSelectToggle : username ? handleStatusToggle : undefined}
      >
        <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          {checkbox}
          <View style={{textAlign: 'right'}}>
            {annotations}
          </View>
        </View>
      </View>
    )
  }

  function indexElement() {
    const goal = sentence.goal.filter(d => !discussions.hideDiscussants[d])
    const goalBorder = goal.includes(username) ? '2px royalblue solid' :
      goal.length !== 0 ? '2px royalblue dashed' :
        '2px transparent solid'
    const indexStyle = {
      color: highlightColor(section, position),
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
        onClick={discussions.selectMode ? handleSelectToggle : handleIndex}
      >
        <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
        <View style={{border: goalBorder, lineHeight: '16px', paddingRight: '4px', paddingLeft: '4px', width: 'fit-content', marginLeft: 'auto'}}>
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
      <View columnStart={3} className={editorLineClassName} style={{paddingTop: '2px'}}
        onClick={discussions.selectMode ? handleSelectToggle : undefined}>
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
      return (
        <View columnStart={4} className={classes} onClick={handleInArgument}>
          <View style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1}}/>
          <View style={{textAlign: 'left'}}>
            <span key="a" className="oi sentence-icon" style={{color: highlightColor(section, position, 'gray')}}
              data-glyph="arrow-thick-right" />
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
            data-glyph="target"
          />
          {name}
        </View>
      ))
      return elements
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
    if (!inSentenceModal) return undefined
    const editorRect = editorContainerRef.current?.getBoundingClientRect()
    const listRect = sentenceListRef.current?.getBoundingClientRect()
    if (!editorRect || !listRect) return undefined
    const sentenceModalStyle = {
      position: 'fixed' as const,
      top: `${editorRect.top - 16}px`,
      left: `${listRect.left}px`,
      width: `${listRect.width}px`,
      paddingTop: `${offsetHeight + 30}px`,
      paddingBottom: '5px',
    }
    return createPortal(
      <>
        <View ref={modalRef} className="sentence-modal" style={sentenceModalStyle}>
          <View style={{paddingLeft: '52px', paddingBottom: '10px'}}>
            {modalAnnotations()}
          </View>
          <View style={{paddingLeft: '50px'}}>{username ? modalActions : undefined}</View>
        </View>
        <View className="sentence-modal-overlay" onClick={handleOverlay} />
      </>,
      document.body
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
    const isArgumentActive = discussions.argumentView?.primaryArgumentPosition === position
    const steps = displayPropositionIndexes.map((index, mapIndex) => {
      const proposition = propositions[index-1]
      const therefore = (mapIndex !== displayPropositionIndexes.length - 1) ? null :
        <View columnStart={1} className={sentenceMetaClassName}>
          <View style={{textAlign: 'right', fontSize: 'larger', lineHeight: '10px'}}>
            {'\u2234'}
          </View>
        </View>
      const fromArgumentClassName = classNames(sentenceMetaClassName, 'sentence-from-argument')
      const arrowCell = mapIndex === 0 ? (
        <View columnStart={1} className={fromArgumentClassName} onClick={handleFromArgument}>
          <View style={{textAlign: 'right'}}>
            <span className="oi sentence-icon"
              style={{color: isArgumentActive ? '#0099ff' : 'gray'}}
              data-glyph="arrow-thick-left" />
          </View>
        </View>
      ) : null
      const color = highlightColor('propositions', index - 1)
      return (
        <Fragment key={mapIndex}>
          {therefore}
          {arrowCell}
          <View columnStart={2} className={sentenceIndexClassName}
            onClick={discussions.selectMode ? handleSelectToggle : undefined}>
            <View style={{textAlign: 'right', color}}>{index}</View>
          </View>
          <View columnEnd={-2} className={sentenceEditorClassName} style={{paddingTop: '4px'}}
            onClick={discussions.selectMode ? handleSelectToggle : undefined}>{proposition.content}</View>
        </Fragment>
      )
    })
    const isLastArgument = discussions.arguments.length - 1 === position
    const padding = isLastArgument ? undefined :
      <View style={{paddingBottom: '10px'}} columnSpan={4} />
    return <>
      {steps}
      {padding}
    </>
  }

  return <>
    {annotationIcons()}
    {indexElement()}
    {editorLine()}
    {inArgumentElement()}
    {sentenceModal()}
    {postSentence()}
  </>
}
