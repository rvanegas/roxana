import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, nanoid} from '@reduxjs/toolkit'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'

const initialState = {
  discussionId: '',
  propositions: [],
  arguments: [],
  layout: '',
  eventQueue: [],
  status: 'init',
  error: null
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
        if (sentence.autoFocus === false) delete sentence.autoFocus
      }
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

function updateDiscussionLayout(discussionId, layout) {
  return async (dispatch, getState) => {
    try {
      const variables = {
        input: {id: discussionId, layout},
        condition: {layout: {eq: getState().discussions.layout}},
      }
      await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
      dispatch(update({discussionId, layout}))
    }
    catch (exception) {
      const errorType = exception.errors ? exception.errors[0].errorType : null
      if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
        const newException = new Error()
        newException.name = 'UnexpectedLayout'
        throw newException
      }
      else {
        throw exception
      }
    }
  }
}

function getDiscussion({id: discussionId, layout: subscriptionLayout}) {
  return async (dispatch, getState) => {
    const loadedSentences = []
    const newDiscussionSentences = {}
    let discussion
    let layout

    async function resetLayout(newLayout, message) {
      await dispatch(update({layout: discussion.layout}))
      await dispatch(updateDiscussionLayout(discussionId, JSON.stringify(newLayout)))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      dispatch(getDiscussionAction({id: discussionId}))
      throw new Error('resetLayout')
    }

    async function parseLayout() {
      try {
        layout = JSON.parse(discussion.layout)
        for (let entry of layout.propositions.concat(layout.arguments)) {
          if (typeof entry.id !== 'string' || typeof entry.index !== 'number') {
            throw new Error('invalid entry')
          }
        }
      }
      catch {
        await resetLayout({propositions: [], arguments: []}, 'invalid layout, parse error')
      }
    }

    async function loadDiscussion() {
      const isReload = state.discussions.discussionId === discussionId
      const limit = isReload ? 1 : 100
      let nextToken
      do {
        const input = {id: discussionId, limit, nextToken}
        const response = await API.graphql(graphqlOperation(custom.getDiscussionPaginated, input))
        discussion = response.data.getDiscussion
        nextToken = discussion.sentences.nextToken
        if (!discussion) throw new Error('no such discussion')
        if (!layout) await parseLayout()
        loadedSentences.push(...discussion.sentences.items)
      } while (nextToken && !isReload)
    }

    async function getSentence(id) {
      const response = await API.graphql(graphqlOperation(queries.getSentence, {id}))
      return response.data.getSentence
    }

    async function removeSentence(section, pos, message) {
      layout[section].splice(pos, 1)
      await resetLayout(layout, message)
    }

    async function readLayout(section) {
      const newSentences = []
      const currentSentences = state.discussions[section]
      for (let pos = 0; pos < layout[section].length; pos++) {
        const layoutEntry = layout[section][pos]
        let sentence = currentSentences.find(s => s.id === layoutEntry.id)
          || loadedSentences.find(s => s.id === layoutEntry.id)
          || await getSentence(layoutEntry.id)
        if (!sentence) await removeSentence(section, pos, 'invalid sentence id, fixing layout')
        const notUnique = newSentences.some(s => s.id === sentence.id)
        if (notUnique) await removeSentence(section, pos, 'non-unique sentence id, fixing layout')
        const newSentence = {
          id: sentence.id,
          key: sentence.key || nanoid(),
          index: layoutEntry.index,
          content: sentence.content
        }
        newSentences.push(newSentence)
      }
      newSentences.push(...currentSentences.filter(p => !p.id))
      newDiscussionSentences[section] = newSentences
    }

    const state = getState()
    const eqDiscussion = discussionId === state.discussions.discussionId
    const eqLayout = subscriptionLayout === state.discussions.layout
    if (!eqDiscussion && state.discussions.discussionId) throw new Error('not implemented')
    if (eqLayout) return

    try {
      await loadDiscussion()
      await readLayout('propositions')
      await readLayout('arguments')
      await dispatch(update({
        discussionId,
        layout: discussion.layout,
        propositions: newDiscussionSentences.propositions,
        arguments: newDiscussionSentences.arguments
      }))
    }
    catch (e) {
      if (e.message !== 'resetLayout') throw e
    }
  }
}

function replaceSentence({key, section, discussionId, content}) {
  return async (dispatch, getState) => {
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
      const input = {input: {content, discussionSentencesId: discussionId}}
      const response = await API.graphql(graphqlOperation(mutations.createSentence, input))
      const newSentenceId = response.data.createSentence.id
      const index = nextUniqueIndex(sentence, sentences)
      const newSentence = {key, index, content, id: newSentenceId}
      const layoutSentences = sentences.map(s => s.key === newSentence.key ? newSentence : s)
      discussionSentences[section] = layoutSentences
      discussionSentences = {
        propositions: discussionSentences.propositions.filter(s => s.id),
        arguments: discussionSentences.arguments.filter(s => s.id),
      }
      // if (!sentence.id) layoutSentences.push(newSentence)
      const makeLayoutEntry = sentence => ({index: sentence.index, id: sentence.id})
      const layout = JSON.stringify({
        propositions: discussionSentences.propositions.map(makeLayoutEntry),
        arguments: discussionSentences.arguments.map(makeLayoutEntry)
      })
      await dispatch(updateDiscussionLayout(discussionId, layout))
      dispatch(updateSentence({section, newSentence: newSentence}))
    }
    catch (exception) {
      if (exception.name === 'UnexpectedLayout') {
        console.warn('try again')
        dispatch(replaceSentenceAction({key, section, discussionId, content}))
      }
      else {
        throw exception
      }
    }
  }
}

const eventHandlerFunctions = {
  getDiscussion,
  replaceSentence,
}

function enqueueEvent(action) {
  const {setStatus, eventEnqueue, eventDequeue} = discussionsSlice.actions
  if (!action.handler) throw new Error('unknown handler', action.handler)
  return async (dispatch, getState) => {
    dispatch(eventEnqueue(action))
    const status = getState().discussions.status
    if (status === 'idle' || status === 'init') {
      dispatch(setStatus('updating'))
      let event
      for (;;) {
        event = getState().discussions.eventQueue[0]
        if (!event) break
        const handler = eventHandlerFunctions[event.handler]
        await dispatch(handler(event.payload))
        dispatch(eventDequeue())
      }
      dispatch(setStatus('idle'))
    }
  }
}

export function getDiscussionAction(discussion) {
  const action = {handler: 'getDiscussion', payload: discussion}
  return dispatch => dispatch(enqueueEvent(action))
}
export function replaceSentenceAction(value) {
  const action = {handler: 'replaceSentence', payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}

export function focusOnNextSentence(section, currentKey) {
  const {addSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    const discussionId = state.discussions.discussionId
    let nextPos = currentKey ? state.discussions[section].findIndex(p => p.key === currentKey) + 1 : 0
    let sentence = state.discussions[section][nextPos]
    if (sentence) {
      dispatch(updateSentence({section, newSentence: {key: sentence.key, autoFocus: true}}))
    }
    else {
      const key = nanoid()
      dispatch(addSentence({section, key}))
      dispatch(updateSentence({section, newSentence: {key, autoFocus: true}}))
      await dispatch(replaceSentenceAction({key, section, discussionId, content: ''}))
    }
  }
}

export const selectDiscussions = state => state.discussions
export const {updateSentence} = discussionsSlice.actions
export default discussionsSlice.reducer
