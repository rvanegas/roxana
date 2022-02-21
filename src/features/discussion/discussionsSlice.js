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

function nextIndex(propositions) {
  return propositions.reduce((max, p) => Math.max(max, p.index), 0) + 1
}

function nextUniqueIndex(proposition, propositions) {
  const indexUnique = propositions.filter(p => p.index === proposition.index).length === 1
  return indexUnique ? proposition.index : nextIndex(propositions)
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
    catch (e) {
      const errorType = e.errors ? e.errors[0].errorType : null
      if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
        throw new Error('unexpected layout')
      }
      else {
        throw e
      }
    }
  }
}

function getDiscussion({id: discussionId, layout: subscriptionLayout}) {
  return async (dispatch, getState) => {
    const loadedPropositions = []
    const newPropositions = []
    let discussion
    let layout

    async function resetLayout(newLayout, message) {
      await dispatch(update({layout: discussion.layout}))
      await dispatch(updateDiscussionLayout(discussionId, JSON.stringify(newLayout)))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      throw new Error(message)
    }

    async function parseLayout() {
      try {
        layout = JSON.parse(discussion.layout)
        for (let entry of layout) {
          if (typeof entry.id !== 'string' || typeof entry.index !== 'number') {
            throw new Error('invalid entry')
          }
        }
      }
      catch {
        await resetLayout([], 'invalid layout, parse error')
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
        nextToken = discussion.propositions.nextToken
        if (!discussion) throw new Error('no such discussion')
        if (!layout) await parseLayout()
        loadedPropositions.push(...discussion.propositions.items)
      } while (nextToken && !isReload)
    }

    async function getProposition(id) {
      const response = await API.graphql(graphqlOperation(queries.getProposition, {id}))
      return response.data.getProposition
    }

    async function removeProposition(pos, message) {
      layout.splice(pos, 1)
      await resetLayout(layout, message)
    }

    async function readLayout() {
      const currentPropositions = state.discussions.propositions
      for (let pos = 0; pos < layout.length; pos++) {
        const layoutEntry = layout[pos]
        let proposition = currentPropositions.find(p => p.id === layoutEntry.id)
          || loadedPropositions.find(p => p.id === layoutEntry.id)
          || await getProposition(layoutEntry.id)
        if (!proposition) await removeProposition(pos, 'invalid proposition id, fixing layout')
        const notUnique = newPropositions.some(p => p.id === proposition.id)
        if (notUnique) await removeProposition(pos, 'non-unique proposition id, fixing layout')
        const newProposition = {
          id: proposition.id,
          key: proposition.key || nanoid(),
          index: layoutEntry.index,
          content: proposition.content
        }
        newPropositions.push(newProposition)
      }
      newPropositions.push(...currentPropositions.filter(p => !p.id))
    }

    const state = getState()
    const eqDiscussion = discussionId === state.discussions.discussionId
    const eqLayout = subscriptionLayout === state.discussions.layout
    if (!eqDiscussion && state.discussions.discussionId) throw new Error('not implemented')
    if (eqLayout) return

    await loadDiscussion()
    await readLayout()
    await dispatch(update({layout: discussion.layout, propositions: newPropositions, discussionId}))
  }
}

function replaceProposition({key, discussionId, content}) {
  return async (dispatch, getState) => {
    const state = getState()
    const propositions = state.discussions.propositions
    const proposition = propositions.find(p => p.key === key)
    if (!proposition) {
      console.error('not found', key, state.discussions.propositions.slice())
      throw new Error('proposition not found')
    }
    const input = {input: {content, discussionPropositionsId: discussionId}}
    const response = await API.graphql(graphqlOperation(mutations.createProposition, input))
    const newPropositionId = response.data.createProposition.id
    try {
      const index = nextUniqueIndex(proposition, propositions)
      const newProposition = {key, index, content, id: newPropositionId}
      const layoutPropositions = propositions.filter(p => p.id)
        .map(p => p.key === proposition.key ? newProposition : p)
      if (!proposition.id) layoutPropositions.push(newProposition)
      const layout = JSON.stringify(layoutPropositions.map(p => ({index: p.index, id: p.id})))
      await dispatch(updateDiscussionLayout(discussionId, layout))
      dispatch(updateSentence({section: 'propositions', newSentence: newProposition}))
    }
    catch (e) {
      if (e.message !== 'unexpected layout') {
        throw e
      }
      else {
        console.warn('try again')
        dispatch(replacePropositionAction({key, discussionId, content}))
      }
    }
  }
}

const eventHandlerFunctions = {
  getDiscussion,
  replaceProposition,
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
export function replacePropositionAction(value) {
  const action = {handler: 'replaceProposition', payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}

export function focusOnNextProposition(currentKey) {
  const {addSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    const discussionId = state.discussions.discussionId
    let nextPos = currentKey ? state.discussions.propositions.findIndex(p => p.key === currentKey) + 1 : 0
    let proposition = state.discussions.propositions[nextPos]
    if (proposition) {
      dispatch(updateSentence({section: 'propositions', newSentence: {key: proposition.key, autoFocus: true}}))
    }
    else {
      const key = nanoid()
      dispatch(addSentence({section: 'propositions', key}))
      dispatch(updateSentence({section: 'propositions', newSentence: {key, autoFocus: true}}))
      await dispatch(replacePropositionAction({key, discussionId, content: ''}))
    }
  }
}

export const selectDiscussions = state => state.discussions
export const {updateSentence} = discussionsSlice.actions
export default discussionsSlice.reducer
