import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
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
      console.log('setStatus', action.payload)
      state.status = action.payload
    },
    eventEnqueue(state, action) {
      console.log('eventEnqueue', action.payload)
      state.eventQueue.push(action.payload)
    },
    eventDequeue(state, action) {
      console.log('eventDequeue', JSON.stringify(state.eventQueue))
      state.eventQueue.shift()
    },

    // updateDiscussionLayout(state, action) {

    // },
//     clearPropositions(state, action) {
//       Object.assign(state, initialState)
//       state.status = 'clearing'
//     },
//     clearingDone(state, action) {
//       state.status = 'idle'
//     }
  },
  extraReducers(builder) {
    builder
      .addCase(getDiscussion.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(getDiscussion.fulfilled, (state, action) => {
        state.status = 'idle'
        console.log('getDiscussion fulfilled', action.payload)
        Object.assign(state, action.payload)
      })
      .addCase(getDiscussion.rejected, (state, action) => {
        state.status = 'failed'
        console.log('getDiscussion rejected', action)
        state.error = action.error.message
      })
      // .addCase(updateDiscussion.fulfilled, (state, action) => {
      //   console.log('getDiscussion fulfilled', action)
      // })
      // .addCase(updateDiscussion.rejected, (state, action) => {
      //   console.log('getDiscussion rejected', action)
      // })
//       .addCase(createProposition.pending, (state, action) => {
//         state.items.push(action.meta.arg)
//       })
//       .addCase(createProposition.fulfilled, (state, action) => {
//         const newProposition = action.payload
//         const proposition = state.items.find(proposition => newProposition.nanoid === proposition.nanoid)
//         if (proposition) {
//           proposition.id = newProposition.id
//           delete proposition.nanoid
//         }
//       })
      // .addCase(replaceIfChangedProposition.rejected, (state, action) => {
      //   console.log('rejected replace', action)
      // })
  }
})

const updateDiscussion = createAsyncThunk(
  'discussions/updatedDiscussion', async (discussion) => {
    // return async (dispatch, getState) => {
    // const state = getState()
    // console.log('updating...')
    // const input = {input: {id, layout}}
    const input = {input: discussion}
    // const condition = {condition: {layout: {eq: state.discussions.layout}}}
    // console.log('input', input, condition)
    const response = await API.graphql(graphqlOperation(mutations.updateDiscussion, input))
    return response
  }
)

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
        // console.log('resetLayout call', discussion.layout)
        await resetLayout([], 'invalid layout, parse error')
      }
    }
    // console.log('loadDiscussion loaded', discussion.propositions.items.length, 'of', limit)
    loadedPropositions.push(...discussion.propositions.items)
  } while (nextToken && !isReload)
  return {layoutJSON, layout, loadedPropositions}
}

async function readLayout(layout, propositions, loadedPropositions, resetLayout) {
  try {
  for (let pos = 0; pos < layout.length; pos++) {
    const entry = layout[pos]
    // console.log('readLayout 0', pos)
    if (propositions.some(p => p.id === entry.id)) {
      // console.log('readLayout 1a', entry.id)
      continue;
    }
    // console.log('readLayout 1b', entry.id)
    let proposition = loadedPropositions.find(p => p.id === entry.id)
    if (!proposition) {
      // console.log('readLayout 2', entry.id)
      const response = await API.graphql(graphqlOperation(queries.getProposition, {id: entry.id}))
      proposition = response.data.getProposition
      if (!proposition) {
        // console.log('readLayout 3', entry.id)
        layout.splice(pos, 1)
        await resetLayout(layout, 'invalid proposition id, fixing layout')
      }
    }
    const notUnique = propositions.some(e => e.id === proposition.id)
    if (notUnique) {
      // console.log('readLayout 4a', entry.id)
      layout.splice(pos, 1)
      await resetLayout(layout, 'non-unique proposition id, fixing layout')
    }
    // console.log('readLayout 4b', entry.id)
    const newProposition = {id: proposition.id, index: entry.index, content: proposition.content}
    propositions.push(newProposition)
    // console.log('readLayout 5', newProposition)
  }
  return propositions
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

export const getDiscussion = createAsyncThunk(
  'discussions/getDiscussion', async (discussionId, {dispatch, getState}) => {
    async function resetLayout(layout, message) {
      // console.log('resetLayout called')
      const discussion = {id: discussionId, layout: JSON.stringify(layout)}
      dispatch(updateDiscussion(discussion))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      throw new Error(message)
    }
    console.log('getting discussion...', discussionId)
    const state = getState()
    const isReload = state.discussions.discussionId === discussionId
    // console.log('getDiscussion 0', isReload)
    const propositions = state.discussions.propositions.slice()
    // console.log('getDiscussion 1', isReload)
    const {layoutJSON, layout, loadedPropositions} = await loadDiscussion(discussionId, isReload, resetLayout)
    // console.log('getDiscussion 2', loadedPropositions.length)
    await readLayout(layout, propositions, loadedPropositions, resetLayout)
    // console.log('getDiscussion 3', propositions.length)
    return {layout: layoutJSON, propositions, discussionId}
  }
)

// loaded
// state

// called from subscription in PropositionList
export function getDiscussionUpdate(discussion) {
  return (dispatch, getState) => {
    // console.log('getDiscussionUpdate', discussion)
    const layout = discussion.layout
    const state = getState()
    if (layout === state.discussions.layout) {
      return
    }
    dispatch(getDiscussion(discussion.id))
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

// replace
// add
// delete

export function replaceIfChangedProposition({propositionId, discussionId, content}) {
  return async (dispatch, getState) => {
    // console.log('replaceIfChangedProposition...', propositionId, discussionId, content)
    const state = getState()
    const proposition = state.discussions.propositions.find(p => p.id === propositionId)
    console.log('top', JSON.stringify(propositionId))
    if (!proposition) {
      throw new Error('proposition not found')
    }
    if (proposition.content === content) {
      // console.log('unchanged.')
      return
    }
    // console.log('replacing.')
    const newProposition = await createProposition({content, discussionPropositionsId: discussionId})
    const layout = JSON.parse(state.discussions.layout)
    const pos = layout.findIndex(p => p.id === propositionId)
    console.log('layoutpos', layout[pos], state.discussions.layout, pos)
    const newEntry = {id: newProposition.id, index: layout[pos].index}
    // console.log('old layout', state.discussions.layout, JSON.stringify(layout))
    layout.splice(pos, 1, newEntry)
    // console.log('new layout', layout)
    const discussion = {id: discussionId, layout: JSON.stringify(layout)}
    dispatch(updateDiscussion(discussion))
  }
}

function createNewProposition(propositionNanoid) {
  return async (dispatch, getState) => {
    const {discussionId, layout: layoutJSON} = getState().discussions
    const newProposition = await createProposition({content: '', discussionPropositionsId: discussionId})
    dispatch(updateProposition({id: newProposition.id, nanoid: propositionNanoid}))
    const layout = JSON.parse(layoutJSON)
    const newEntry = {id: newProposition.id, index: layout.length}
    layout.push(newEntry)
    const discussion = {id: discussionId, layout: JSON.stringify(layout)}
    await dispatch(updateDiscussion(discussion))
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
    console.log('handling1', payload)
    await new Promise(res => setTimeout(res, 1000))
    console.log('handling2', payload)
  }
}

const eventHandlerFunctions = {
  replaceIfChangedProposition,
  updateDiscussion,
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
        if (!event) break;
        console.log('start', JSON.stringify(event))
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
