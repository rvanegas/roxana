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

const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    addProposition(state, action) {
      const id = action.payload
      const proposition = {id, key: id, content: '', index: state.propositions.length}
      state.propositions.push(proposition)
    },
    updateProposition(state, action) {
      const newProposition = action.payload
      const proposition = state.propositions.find(p => p.key === newProposition.key)
      if (proposition) {
        Object.assign(proposition, newProposition)
        if (proposition.autoFocus === false) delete proposition.autoFocus
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

function updateDiscussionLayout(discussionId, layout) {
  return async (dispatch, getState) => {
    try {
      const variables = {input: {id: discussionId, layout}, condition: {layout: {eq: getState().discussions.layout}}}
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

async function loadDiscussion(discussionId, isReload, resetLayout) {
  let discussion
  let layout
  let layoutJSON

  async function getLayout() {
    try {
      layoutJSON = discussion.layout
      layout = JSON.parse(layoutJSON)
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

  const loadedPropositions = []
  const limit = isReload ? 1 : 100
  let nextToken

  do {
    const input = {id: discussionId, limit, nextToken}
    const response = await API.graphql(graphqlOperation(custom.getDiscussionPaginated, input))
    discussion = response.data.getDiscussion
    nextToken = discussion.propositions.nextToken
    if (!discussion) throw new Error('no such discussion')
    if (!layout) await getLayout()
    loadedPropositions.push(...discussion.propositions.items)
  } while (nextToken && !isReload)
  return {layoutJSON, layout, loadedPropositions}
}

async function readLayout(layout, currentPropositions, loadedPropositions, resetLayout) {
  async function getProposition(id) {
    const response = await API.graphql(graphqlOperation(queries.getProposition, {id}))
    return response.data.getProposition
  }
  async function removeProposition(pos, message) {
    layout.splice(pos, 1)
    await resetLayout(layout, message)
  }
  const newPropositions = []
  try {
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
    newPropositions.push(...currentPropositions.filter(p => p.key === p.id))
    return newPropositions
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

function getDiscussion({id: discussionId, layout: subscriptionLayout}) {
  return async (dispatch, getState) => {
    async function resetLayout(layout, message) {
      dispatch(updateDiscussionLayout(discussionId, JSON.stringify(layout)))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      throw new Error(message)
    }
    const state = getState()
    const eqDiscussion = discussionId === state.discussions.discussionId
    const eqLayout = subscriptionLayout === state.discussions.layout
    if (!eqDiscussion && state.discussions.discussionId) throw new Error('not implemented')
    if (eqLayout) return
    const isReload = state.discussions.discussionId === discussionId
    const propositions = state.discussions.propositions.slice()
    const {layoutJSON, layout, loadedPropositions} = await loadDiscussion(discussionId, isReload, resetLayout)
    const newPropositions = await readLayout(layout, propositions, loadedPropositions, resetLayout)
    await dispatch(update({layout: layoutJSON, propositions: newPropositions, discussionId}))
  }
}

async function createProposition(proposition) {
  try {
    const input = {input: proposition}
    const response = await API.graphql(graphqlOperation(mutations.createProposition, input))
    return response.data.createProposition
  }
  catch {
    throw new Error('network down')
  }
}

function replaceProposition({key, discussionId, content}) {
  return async (dispatch, getState) => {
    const state = getState()
    const proposition = state.discussions.propositions.find(p => p.key === key)
    console.log('replace', key, content)
    if (!proposition) {
      console.log('not found', key, state.discussions.propositions.slice())
      throw new Error('proposition not found')
    }
    const newProposition = await createProposition({content, discussionPropositionsId: discussionId})
    const newPropositionId = newProposition.id
    for (;;) {
      try {
        const layout = JSON.stringify(
          JSON.parse(getState().discussions.layout).map(entry =>
            entry.id === propositionId ? {id: newPropositionId, index: entry.index} : entry
          )
        )
        await dispatch(updateDiscussionLayout(discussionId, layout))
        dispatch(updateProposition({key, content, id: newPropositionId}))
        break
      }
      catch (e) {
        if (e.message !== 'unexpected layout') {
          throw e
        }
        else {
          console.log('try again')
        }
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

export function focusOnProposition(newIndex) {
  const {addProposition} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    const discussionId = state.discussions.discussionId
    let proposition = state.discussions.propositions.find(p => p.index === newIndex)
    if (proposition) {
      dispatch(updateProposition({id: proposition.id, autoFocus: true}))
    }
    else {
      const key = nanoid()
      dispatch(addProposition(key))
      dispatch(updateProposition({key, autoFocus: true}))
      await dispatch(replacePropositionAction({key, discussionId, content: ''}))
    }
  }
}

export const selectDiscussion = state => state.discussions
export const {updateProposition} = discussionsSlice.actions
export default discussionsSlice.reducer
