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

export const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    addProposition(state, action) {
      const id = action.payload
      const proposition = {id, key: id, content: '', index: state.propositions.length}
      state.propositions.push(proposition)
    },
    updateProposition(state, action) {
      const proposition = state.propositions.find(p => p.id === action.payload.id)
      if (proposition) {
        Object.assign(proposition, action.payload)
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

function updateDiscussionLayout(discussionId, layout) {
  return async (dispatch, getState) => {
    const variables = {input: {id: discussionId, layout}, condition: {layout: {eq: getState().discussions.layout}}}
    await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
    dispatch(update({discussionId, layout}))
  }
}

async function loadDiscussion(discussionId, isReload, resetLayout) {
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
  let discussion
  let nextToken
  let layout
  let layoutJSON
  do {
    const input = {id: discussionId, limit, nextToken}
    console.log('start4')
    const response = await API.graphql(graphqlOperation(custom.getDiscussionPaginated, input))
    console.log('start5', response)
    discussion = response.data.getDiscussion
    nextToken = discussion.propositions.nextToken
    if (!discussion) throw new Error('no such discussion')
    if (!layout) await getLayout()
    loadedPropositions.push(...discussion.propositions.items)
    console.log('start6')
  } while (nextToken && !isReload)
  console.log('start7')
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
  console.log('start0')
    const {layoutJSON, layout, loadedPropositions} = await loadDiscussion(discussionId, isReload, resetLayout)
  console.log('start1')
    const newPropositions = await readLayout(layout, propositions, loadedPropositions, resetLayout)
  console.log('start2')
    await dispatch(update({layout: layoutJSON, propositions: newPropositions, discussionId}))
  console.log('start3')
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

export function replaceProposition({propositionId, discussionId, content}) {
  return async (dispatch, getState) => {
    const state = getState()
    const proposition = state.discussions.propositions.find(p => p.id === propositionId)
    if (!proposition) throw new Error('proposition not found')
    const newDbProposition = await createProposition({content, discussionPropositionsId: discussionId})
    for (;;) {
      try {
        const state = getState()
        const layout = JSON.parse(state.discussions.layout)
        const propositions = state.discussions.propositions.slice()
        const pos = propositions.findIndex(p => p.id === propositionId)
        const newEntry = {id: newDbProposition.id, key: nanoid(), index: propositions[pos].index}
        const newProposition = {content}
        Object.assign(newProposition, newEntry)
        layout.splice(pos, 1, newEntry)
        propositions.splice(pos, 1, newProposition)
        await dispatch(updateDiscussionLayout(discussionId, JSON.stringify(layout)))
        dispatch(update({propositions}))
        return
      }
      catch(error) {
        const errorType = error.errors ? error.errors[0].errorType : null
        if (errorType !== 'DynamoDB:ConditionalCheckFailedException') {
          throw error
        }
      }
    }
  }
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
      const propositionId = nanoid()
      dispatch(addProposition(propositionId))
      dispatch(updateProposition({id: propositionId, autoFocus: true}))
      await dispatch(replacePropositionAction({propositionId, discussionId, content: ''}))
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

export const selectDiscussion = state => state.discussions
export const {update, updateProposition} = discussionsSlice.actions
export default discussionsSlice.reducer
