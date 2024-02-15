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
  status: 'idle',
  error: null
}

export const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    addNanoProposition(state, action) {
      state.propositions.push(action.payload)
    },
    updateProposition(state, action) {
      const key = action.payload.nanoid ? 'nanoid' : 'id'
      const proposition = state.propositions.find(p => p[key] === action.payload[key])
      if (proposition) {
        Object.assign(proposition, action.payload)
        if (proposition.autoFocus === false) delete proposition.autoFocus
      }
    },
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
        state.status = 'succeeded'
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
    // console.log('updating...')
    const input = {input: discussion}
    // console.log('input', input)
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

async function readLayout(layout, loadedPropositions, resetLayout) {
  const propositions = []
  for (let pos = 0; pos < layout.length; pos++) {
    const entry = layout[pos]
    let proposition = loadedPropositions.find(p => p.id === entry.id)
    if (!proposition) {
      const response = await API.graphql(graphqlOperation(queries.getProposition, {id: entry.id}))
      proposition = response.data.getProposition
      if (!proposition) {
        layout.splice(pos, 1)
        await resetLayout(layout, 'invalid proposition id, fixing layout')
      }
    }
    const notUnique = propositions.some(p => p.id === proposition.id)
    if (notUnique) {
      layout.splice(pos, 1)
      await resetLayout(layout, 'non-unique proposition id, fixing layout')
    }
    propositions.push({id: proposition.id, index: entry.index, content: proposition.content})
  }
  return propositions
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
    // console.log('getting discussion...', discussionId)
    const state = getState()
    const isReload = state.discussions.discussionId === discussionId
    const {layoutJSON, layout, loadedPropositions} = await loadDiscussion(discussionId, isReload, resetLayout)
    const propositions = await readLayout(layout, loadedPropositions, resetLayout)
    return {layout: layoutJSON, propositions, discussionId}
  }
)

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

export function replaceIfChangedProposition(propositionId, discussionId, content) {
  console.log('not found 0', JSON.stringify(propositionId))
  return async (dispatch, getState) => {
    // console.log('replaceIfChangedProposition...', propositionId, discussionId, content)
    const state = getState()
    const proposition = state.discussions.propositions.find(p => p.id === propositionId)
    console.log('not found 1', state.discussions.propositions)
    console.log('not found 2', JSON.stringify(propositionId))
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
    const newEntry = {id: newProposition.id, index: layout[pos].index}
    // console.log('old layout', state.discussions.layout, JSON.stringify(layout))
    layout.splice(pos, 1, newEntry)
    // console.log('new layout', layout)
    const discussion = {id: discussionId, layout: JSON.stringify(layout)}
    dispatch(updateDiscussion(discussion))
  }
}

async function addProposition({discussionId, layout: layoutJSON}, dispatch) {
  const layout = JSON.parse(layoutJSON)
  const newPropositionNanoid = nanoid()
  dispatch(addNanoProposition({id: newPropositionNanoid, nanoid: newPropositionNanoid, content: '', index: layout.length}))
  const newProposition = await createProposition({content: '', discussionPropositionsId: discussionId})
  dispatch(updateProposition({id: newProposition.id, nanoid: newPropositionNanoid}))
  const newEntry = {id: newProposition.id, index: layout.length}
  layout.push(newEntry)
  const discussion = {id: discussionId, layout: JSON.stringify(layout)}
  dispatch(updateDiscussion(discussion))
  return newProposition.id
}

export function focusOnProposition(newIndex) {
  return async (dispatch, getState) => {
    const state = getState()
    let proposition = state.discussions.propositions.find(p => p.index === newIndex)
    const propositionId = proposition ? proposition.id : await addProposition(state.discussions, dispatch)
    dispatch(updateProposition({id: propositionId, autoFocus: true}))
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

export const selectDiscussion = state => state.discussions
// export const selectPropositionsStatus = state => state.propositions.status
export const {updateProposition, addNanoProposition} = discussionsSlice.actions
export default discussionsSlice.reducer
