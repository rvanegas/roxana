import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, nanoid} from '@reduxjs/toolkit'
import Cookies from 'universal-cookie'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'
import {
  discussionIdFromUrl,
  redirectToDiscussionId,
  generateDiscussionId,
  incrementDiscussionIdLength
} from '../../app/util'

const cookies = new Cookies()
const cookieKey = 'roxanaDiscussionId'

const initialState = {
  eventQueue: [],
  status: 'init',
  error: null,
  discussionId: null,
  version: null,
  propositions: null,
  arguments: null,
}

// do this in TS
// function validateSection(section) {
//   if (section !== 'arguments' && section !== 'propositions') throw new Error('invalid section')
// }

const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    addSentence(state, action) {
      const {section, key} = action.payload
      // validateSection(section)
      const sentence = {key, content: '', index: nextIndex(state[section])}
      state[section].push(sentence)
    },
    updateSentence(state, action) {
      const {section, newSentence} = action.payload
      const sentence = state[section].find(p => p.key === newSentence.key)
      if (sentence) {
        Object.assign(sentence, newSentence)
      }
    },
    setFocus(state, action) {
      const {section, position} = action.payload
      state[section][position].autoFocus = true
    },
    unsetFocus(state, action) {
      const {section, position} = action.payload
      delete state[section][position].autoFocus
    },
    setStatus(state, action) {
      state.status = action.payload
    },
    eventEnqueue(state, action) {
      state.eventQueue.push(action.payload)
    },
    eventDequeue(state, action) {
      state.eventQueue.shift()
    },
    updateSentences(state, action) {
      function mergeInNewSentences(section) {
        const unsavedSentences = state[section].filter(s => !s.id)
        const base = nextIndex(newSentences[section])
        const reindexedUnsavedSentences = unsavedSentences.map((sentence, i) => {
          sentence.index = base + i;
          return sentence
        })
        state[section] = newSentences[section].concat(reindexedUnsavedSentences)
      }
      const {version, newSentences} = action.payload
      state.version = version
      mergeInNewSentences('propositions')
      mergeInNewSentences('arguments')
    },
    update(state, action) {
      Object.assign(state, action.payload)
    }
  }
})

const {update} = discussionsSlice.actions

function nextIndex(sentences) {
  return sentences.reduce((max, p) => Math.max(max, p.index), 0) + 1
}

function nextUniqueIndex(sentence, sentences) {
  const indexUnique = sentences.filter(p => p.index === sentence.index).length === 1
  return indexUnique ? sentence.index : nextIndex(sentences)
}

function updateDiscussionLayout({layout, isReset}) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const id = state.discussions.discussionId
      const oldVersion = state.discussions.version
      const version = oldVersion + 1
      const variables = {
        input: {id, layout, version},
        version: {layout: {eq: {oldVersion}}},
      }
      await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
      dispatch(update({version}))
    }
    catch (exception) {
      const errorType = exception.errors ? exception.errors[0].errorType : null
      if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
        const newException = new Error()
        newException.name = 'UnexpectedLayoutVersion'
        throw newException
      }
      else {
        throw exception
      }
    }
  }
}

function getDiscussion({discussionId, layout, version}) {
  return async (dispatch, getState) => {
    const newSentences = {propositions: [], arguments: []}
    let currentSentences = []
    let discussion
    let layoutEntries


    async function resetLayout(message) {
      await dispatch(updateDiscussionLayout({layout: JSON.stringify(layoutEntries), isReset: true}))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      dispatch(getDiscussionAction({discussionId}))
      throw new Error('resetLayout')
    }

    async function parseLayout() {
      try {
        layoutEntries = JSON.parse(layout)
        for (let entry of layoutEntries.propositions.concat(layoutEntries.arguments)) {
          if (typeof entry.id !== 'string' || typeof entry.index !== 'number') {
            throw new Error('invalid entry')
          }
        }
      }
      catch {
        layoutEntries = {propositions: [], arguments: []}
        await resetLayout('invalid layout, parse error')
      }
    }

    async function loadDiscussion() {
      const input = {id: discussionId}
      const response = await API.graphql(graphqlOperation(custom.getDiscussionSimple, input))
      discussion = response.data.getDiscussion
      if (!discussion) {
        throw new Error('no such discussion')
      }
      currentSentences = discussion.currentSentences.items
      version = discussion.version
      layout = discussion.layout
    }

    async function getSentence(id) {
      const response = await API.graphql(graphqlOperation(queries.getSentence, {id}))
      return response.data.getSentence
    }

    async function removeSentence(section, pos, message) {
      layoutEntries[section].splice(pos, 1)
      await resetLayout(message)
    }

    async function readLayout(section) {
      const stateSentences = state.discussions[section]
      for (let pos = 0; pos < layoutEntries[section].length; pos++) {
        const layoutEntry = layoutEntries[section][pos]
        const sentence = stateSentences.find(s => s.id === layoutEntry.id)
          || currentSentences.find(s => s.id === layoutEntry.id)
          || await getSentence(layoutEntry.id)
        if (!sentence) {
          await removeSentence(section, pos, 'invalid sentence id, fixing layout')
        }
        const notUnique = newSentences[section].some(s => s.id === sentence.id)
        if (notUnique) {
          await removeSentence(section, pos, 'non-unique sentence id, fixing layout')
        }
        const newSentence = {
          id: sentence.id,
          key: sentence.key || nanoid(),
          index: layoutEntry.index,
          content: sentence.content
        }
        newSentences[section].push(newSentence)
      }
    }

    const state = getState()
    if (state.discussions.discussionId && state.discussions.discussionId !== discussionId) {
      throw new Error('not implemented')
    }
    if (version && version <= state.discussions.version) {
      return
    }

    try {
      if (!version || version === 0) {
        await loadDiscussion()
      }
      await parseLayout()
      await readLayout('propositions')
      await readLayout('arguments')
      const {updateSentences} = discussionsSlice.actions
      dispatch(updateSentences({version, newSentences}))
    }
    catch (exception) {
      if (exception.message !== 'resetLayout') {
        throw exception
      }
    }
  }
}

function initializeDiscussion({discussionId}) {
  return async (dispatch, getState) => {
    if (!discussionId) {
      discussionId = discussionIdFromUrl()
      if (discussionId) {
        cookies.set(cookieKey, discussionId)
      }
    }
    if (!discussionId) {
      discussionId = cookies.get(cookieKey)
      if (discussionId) {
        redirectToDiscussionId(discussionId)
      }
      else {
        await dispatch(createNewDiscussionAction())
      }
      return
    }
    try {
      dispatch(update({discussionId, version: 0, propositions: [], arguments: []}))
      await dispatch(getDiscussion({discussionId}))
    }
    catch {
      await dispatch(createNewDiscussionAction())
      return
    }
    if (getState().discussions.propositions.length === 0) {
      await dispatch(addNewSentence('propositions'))
    }
    if (getState().discussions.arguments.length === 0) {
      await dispatch(addNewSentence('arguments'))
    }
    dispatch(focusOnSentence('propositions', 0))
  }
}

function createNewDiscussion() {
  return async (dispatch) => {
    const layout = JSON.stringify({propositions: [], arguments: []})
    const version = 1
    const variables = {input: {layout, version}}
    for (;;) {
      try {
        const discussionId = generateDiscussionId()
        variables.input.id = discussionId
        await API.graphql(graphqlOperation(mutations.createDiscussion, variables))
        cookies.set(cookieKey, discussionId)
        redirectToDiscussionId(discussionId)
        break
      }
      catch (exception) {
        const errorType = exception.errors ? exception.errors[0].errorType : null
        if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
          // console.log('failed create, retrying...')
          incrementDiscussionIdLength()
        }
        else {
          throw exception
        }
      }
    }
  }
}

function replaceSentence({key, section, discussionId, content}) {
  return async (dispatch, getState) => {
    const {updateSentence} = discussionsSlice.actions
    try {
      const state = getState()
      let discussionSentences = {
        propositions: state.discussions.propositions,
        arguments: state.discussions.arguments,
      }
      const sentences = discussionSentences[section]
      const sentence = sentences.find(s => s.key === key)
      if (!sentence) {
        console.error('not found', key, section, discussionSentences)
        throw new Error('sentence not found')
      }
      const variables = {input: {content, discussionId, currentDiscussionId: discussionId}}
      const response = await API.graphql(graphqlOperation(mutations.createSentence, variables))
      const newSentenceId = response.data.createSentence.id
      const index = nextUniqueIndex(sentence, sentences)
      const newSentence = {key, index, content, id: newSentenceId}
      const layoutSentences = sentences.map(s => s.key === newSentence.key ? newSentence : s)
      discussionSentences[section] = layoutSentences
      discussionSentences = {
        propositions: discussionSentences.propositions.filter(s => s.id),
        arguments: discussionSentences.arguments.filter(s => s.id),
      }
      const makeLayoutEntry = sentence => ({index: sentence.index, id: sentence.id})
      const layout = JSON.stringify({
        propositions: discussionSentences.propositions.map(makeLayoutEntry),
        arguments: discussionSentences.arguments.map(makeLayoutEntry)
      })
      await dispatch(updateDiscussionLayout({layout}))
      dispatch(updateSentence({section, newSentence}))
    }
    catch (exception) {
      if (exception.name === 'UnexpectedLayoutVersion') {
        console.warn('try again')
        dispatch(replaceSentenceAction({key, section, discussionId, content}))
      }
      else {
        throw exception
      }
    }
  }
}

function addNewSentence(section, andFocus) {
  return async (dispatch, getState) => {
    const discussionId = getState().discussions.discussionId
    const {addSentence} = discussionsSlice.actions
    const key = nanoid()
    dispatch(addSentence({section, key}))
    dispatch(replaceSentenceAction({key, section, discussionId, content: ''}))
  }
}

const eventHandlerFunctions = {
  createNewDiscussion,
  initializeDiscussion,
  getDiscussion,
  replaceSentence,
}

function enqueueEvent(action) {
  const {setStatus, eventEnqueue, eventDequeue} = discussionsSlice.actions
  if (!action.handler) {
    throw new Error('unknown handler', action.handler)
  }
  return async (dispatch, getState) => {
    dispatch(eventEnqueue(action))
    const status = getState().discussions.status
    if (status === 'idle' || status === 'init') {
      dispatch(setStatus('updating'))
      let event
      for (;;) {
        event = getState().discussions.eventQueue[0]
        if (!event) {
          break
        }
        const handler = eventHandlerFunctions[event.handler]
        await dispatch(handler(event.payload))
        dispatch(eventDequeue())
      }
      dispatch(setStatus('idle'))
    }
  }
}

export function createNewDiscussionAction() {
  const action = {handler: 'createNewDiscussion'}
  return dispatch => dispatch(enqueueEvent(action))
}
export function initializeDiscussionAction(discussion) {
  const action = {handler: 'initializeDiscussion', payload: discussion}
  return dispatch => dispatch(enqueueEvent(action))
}
export function getDiscussionAction(discussion) {
  const action = {handler: 'getDiscussion', payload: discussion}
  return dispatch => dispatch(enqueueEvent(action))
}
export function replaceSentenceAction(value) {
  const action = {handler: 'replaceSentence', payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}

export function focusOnSentence(section, position) {
  const {setFocus} = discussionsSlice.actions
  return async (dispatch, getState) => {
    let state = getState()
    if (state.discussions[section].length < position) {
      throw new Error('position too high')
    }
    let sentence = state.discussions[section][position]
    if (!sentence) {
      await dispatch(addNewSentence(section))
    }
    dispatch(setFocus({section, position}))
  }
}

export function propositionIdsFromArgument(argument) {
  return argument.content ? argument.content.split(' ') : []
}

export const selectDiscussions = state => state.discussions
export const {unsetFocus} = discussionsSlice.actions
export default discussionsSlice.reducer
