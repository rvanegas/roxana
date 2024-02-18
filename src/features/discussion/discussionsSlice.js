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
      const proposition = {id, nanoid: id, content: '', index: state.propositions.length}
      state.propositions.push(proposition)
    },
    updateProposition(state, action) {
      const key = action.payload.nanoid ? 'nanoid' : 'id'
      const proposition = state.propositions.find(p => p[key] === action.payload[key])
      if (proposition) {
        Object.assign(proposition, action.payload)
        if (proposition.autoFocus === false) delete proposition.autoFocus
      }
    },
    setStatus(state, action) {
      // console.log('setStatus', action.payload)
      state.status = action.payload
    },
    eventEnqueue(state, action) {
      // console.log('eventEnqueue', action.payload)
      state.eventQueue.push(action.payload)
    },
    eventDequeue(state, action) {
      // console.log('eventDequeue', JSON.stringify(state.eventQueue))
      state.eventQueue.shift()
    },
    update(state, action) {
      console.log('update', action.payload)
      Object.assign(state, action.payload)
    }
  }
})

const update = discussionsSlice.actions.update

function logLayouts({layout, propositions}) {
  const layoutIds = JSON.stringify(JSON.parse(layout).map(e => e.id))
  const propIds = JSON.stringify(propositions.filter(p => !p.nanoid).map(p => p.id))
  const eqs = layoutIds === propIds
  console.log('ids equality', eqs)
  if (!eqs) {
    console.log('ids', layoutIds, propIds)
  }
}

function updateDiscussionLayout(discussionId, layout) {
  return async (dispatch, getState) => {
    logLayouts(getState().discussions)
    const variables = {input: {id: discussionId, layout}, condition: {layout: {eq: getState().discussions.layout}}}
    await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
    dispatch(update({discussionId, layout}))
    // logLayouts(getState().discussions)
  }
}

async function loadDiscussion(discussionId, isReload, resetLayout) {
  const loadedPropositions = []
  const limit = isReload ? 1 : 100
  let nextToken
  let layout
  let layoutJSON
  do {
    const input = {id: discussionId, limit, nextToken}
    const response = await API.graphql(graphqlOperation(custom.getDiscussionPaginated, input))
    const discussion = response.data.getDiscussion
    nextToken = discussion.propositions.nextToken
    if (!discussion) {
      throw new Error('no such discussion')
    }
    if (!layout) {
      try {
        layoutJSON = discussion.layout
        layout = JSON.parse(layoutJSON)
        for (let entry of layout) {
          if (typeof entry.id !== 'string' || typeof entry.index !== 'number') {
            throw new Error('invalid entry')
          }
        }
      } catch {
        await resetLayout([], 'invalid layout, parse error')
      }
    }
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
      const notUnique = currentPropositions.some(p => p.id === proposition.id)
      if (notUnique) await removeProposition(pos, 'non-unique proposition id, fixing layout')
      const newProposition = {id: proposition.id, index: layoutEntry.index, content: proposition.content}
      newPropositions.push(newProposition)
    }
    newPropositions.push(...currentPropositions.filter(p => p.nanoid))
    return newPropositions
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

function getDiscussion({discussionId, layout: subscriptionLayout}) {
  return async (dispatch, getState) => {
    async function resetLayout(layout, message) {
      // const discussion = {id: discussionId, layout: JSON.stringify(layout)}
      dispatch(updateDiscussionLayout(discussionId, JSON.stringify(layout)))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      throw new Error(message)
    }
    console.log('getdiscussion.', discussionId)
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
  } catch {
    throw new Error('network down')
  }
}

export function replaceIfChangedProposition({propositionId, discussionId, content}) {
  return async (dispatch, getState) => {
    // console.log('replaceIfChangedProposition...', propositionId, discussionId, content)
    const state = getState()
    const proposition = state.discussions.propositions.find(p => p.id === propositionId)
    // console.log('top', JSON.stringify(propositionId))
    if (!proposition) {
      throw new Error('proposition not found')
    }
    if (proposition.content === content) {
      // console.log('unchanged.')
      return
    }
    // console.log('replacing.')
    const newProposition = await createProposition({content, discussionPropositionsId: discussionId})
    //---
    for (;;) {
      try {
        const state = getState()
        const layout = JSON.parse(state.discussions.layout)
        const propositions = state.discussions.propositions.slice()
        const pos = layout.findIndex(p => p.id === propositionId)
        // console.log('layoutpos', layout[pos], state.discussions.layout, pos)
        const newEntry = {id: newProposition.id, index: layout[pos].index}
        console.log('old layout', layout.slice())
        layout.splice(pos, 1, newEntry)
        propositions.splice(pos, 1, newProposition)
        console.log('new layout', layout.slice())
        // const discussion = {id: discussionId, layout: }
        await dispatch(updateDiscussionLayout(discussionId, JSON.stringify(layout)))
        dispatch(update({propositions}))
        logLayouts(getState().discussions)
        return
      } catch(error) {
        const errorType = error.errors ? error.errors[0].errorType : null
        if (errorType !== 'DynamoDB:ConditionalCheckFailedException') {
          throw error
        }
      }
    }
  }
}

function createNewProposition(propositionNanoid) {
  return async (dispatch, getState) => {
    const {discussionId} = getState().discussions
    const newProposition = await createProposition({content: '', discussionPropositionsId: discussionId})
    dispatch(updateProposition({id: newProposition.id, nanoid: propositionNanoid}))
    //---
    for (;;) {
      try {
        console.log('trying...')
        const layoutJSON = getState().discussions.layout
        const layout = JSON.parse(layoutJSON)
        const newEntry = {id: newProposition.id, index: layout.length}
        layout.push(newEntry)
        // const discussion = {id: discussionId, layout: JSON.stringify(layout)}
        await dispatch(updateDiscussionLayout(discussionId, JSON.stringify(layout)))
        console.log('worked')
        return
      } catch (error) {
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
    let proposition = state.discussions.propositions.find(p => p.index === newIndex)
    if (proposition) {
      dispatch(updateProposition({id: proposition.id, autoFocus: true}))
    } else {
      const propositionNanoid = nanoid()
      dispatch(addProposition(propositionNanoid))
      dispatch(updateProposition({id: propositionNanoid, autoFocus: true}))
      await dispatch(createNewPropositionAction(propositionNanoid))
    }
  }
}

// export function clearPropositionsThunk() {
//   return async (dispatch, getState) => {
//     console.log('clearing...')
//     const state = getState()
//     const propositionIds = state.propositions.items.map(proposition => proposition.id)
//     dispatch(propositionsSlice.actions.clearPropositions())
//     const deletePromises = propositionIds.map(id =>
//       API.graphql(graphqlOperation(mutations.deleteProposition, {input: {id}}))
//     )
//     await Promise.all(deletePromises)
//     dispatch(propositionsSlice.actions.clearingDone())
//   }
// }

function consoleHandler(payload) {
  return async dispatch => {
    await new Promise(res => setTimeout(res, 1000))
    console.log('handling', payload)
  }
}

const eventHandlerFunctions = {
  replaceIfChangedProposition,
  updateDiscussionLayout,
  getDiscussion,
  createNewProposition,
  consoleHandler,
}

function enqueueEvent(action) {
  const {setStatus, eventEnqueue, eventDequeue} = discussionsSlice.actions
  if (!action.handler) throw new Error('unknown handler', action.handler)
  return async (dispatch, getState) => {
    dispatch(eventEnqueue(action))
    console.log('enqueued', action)
    const status = getState().discussions.status
    if (status === 'idle' || status === 'init') {
      dispatch(setStatus('updating'))
      let event
      for (;;) {
        event = getState().discussions.eventQueue[0]
        if (!event) break
        console.log('start', event)
        const handler = eventHandlerFunctions[event.handler]
        await dispatch(handler(event.payload))
        console.log('finish', event)
        dispatch(eventDequeue())
      }
      dispatch(setStatus('idle'))
    }
  }
}

export function getDiscussionAction(discussionId) {
  const action = {handler: 'getDiscussion', payload: discussionId}
  return dispatch => dispatch(enqueueEvent(action))
}

export function consoleHandlerAction(message) {
  const action = {handler: 'consoleHandler', payload: message}
  return dispatch => dispatch(enqueueEvent(action))
}

export function createNewPropositionAction(propositionNanoid) {
  const action = {handler: 'createNewProposition', payload: propositionNanoid}
  return dispatch => dispatch(enqueueEvent(action))
}

export function replaceIfChangedPropositionAction(propositionNanoid) {
  const action = {handler: 'replaceIfChangedProposition', payload: propositionNanoid}
  return dispatch => dispatch(enqueueEvent(action))
}

export const selectDiscussion = state => state.discussions
export const {updateProposition} = discussionsSlice.actions
export default discussionsSlice.reducer
