import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

const discussionId = 'd172f9ff-8e5b-4229-b803-aee6dc8855a2'

function newProposition(id, index) {
  const proposition = {
    id,
    nanoid: id,
    index,
    content: '',
    discussionId
  }
  if (index === 0) proposition.autoFocus = true
  return proposition
}

const initialState = {
  propositions: [],
  arguments: [],
  layout: [],
  status: 'idle',
  error: null
}

export const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
//     updateProposition(state, action) {
//       const proposition = state.items.find(proposition => action.payload.id === proposition.id)
//       if (proposition) {
//         Object.assign(proposition, action.payload)
//         if (proposition.autoFocus === false) delete proposition.autoFocus
//       } else {
//         state.items.push(action.payload)
//       }
//     },
//     focusOnProposition(state, action) {
//       const newIndex = action.payload
//       const proposition = state.items.find(proposition => newIndex === proposition.index)
//       proposition.autoFocus = true
//     },
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
        // state.layout = JSON.parse(action.payload.layout)
        // state.layout = action.payload
      })
      .addCase(getDiscussion.rejected, (state, action) => {
        state.status = 'failed'
        console.log('getDiscussion rejected', action)
        state.error = action.error.message
      })
      .addCase(updateDiscussion.rejected, (state, action) => {
        console.log('getDiscussion rejected', action)
        // state.error = action.error.message
      })
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
//       .addCase(createProposition.rejected, (state, action) => {
//         console.log('rejected create', action)
//       })
  }
})

// function loadLayout(discussion, propositions) {
//   try {
//     const layout = JSON.parse(discussion.layout)


//     const layoutPropositions = layout.map(propositionPosition => {})
//     for (let propositionPosition in layout.propositions) {
//       propositionPosition
//     }
//     // for (layout)
//   } catch {
//     const layout = propositions.map((proposition, index) => {
//       proposition.index = index
//       return {id: proposition.id, index}
//     })
//     // dispatch(writeLayout(layout))
//   }
// }

export const updateDiscussion = createAsyncThunk(
  'discussions/updatedDiscussion', async (discussion) => {
    console.log('updating...')
    const input = {input: discussion}
    console.log('input', input)
    const response = await API.graphql(graphqlOperation(mutations.updateDiscussion, input))
    return response
  }
)

export const getDiscussion2 = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      propositions {
        items {
          id
          content
          createdAt
          updatedAt
          discussionPropositionsId
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`

export const getDiscussion = createAsyncThunk(
  'discussions/getDiscussion', async (_, {dispatch}) => {
    console.log('getting discussion...')
    const loadedPropositions = []
    const propositions = []
    let nextToken
    let layout
    do {
      const response = await API.graphql(graphqlOperation(getDiscussion2, {id: discussionId}))
      const discussion = response.data.getDiscussion
      nextToken = discussion.propositions.nextToken
      if (!discussion) {
        throw 'no such discussion'
      }
      if (!layout) {
        try {
          layout = JSON.parse(discussion.layout)
        } catch {
          const discussion = {id: discussion.id, layout: JSON.stringify([])}
          dispatch(updateDiscussion(discussion))
          throw 'invalid layout'
        }
      }
      console.log('layout', layout)
      loadedPropositions.push(...discussion.propositions.items)
    } while (nextToken)

    try {
      layout.map(async position => {
        const proposition = loadedPropositions.find(proposition => proposition.id === position.id)
        if (proposition) {
          propositions.push({id: proposition.id, index: position.index, content: proposition.content})
        } else {
          const response = await API.graphql(graphqlOperation(queries.getProposition, {id: position.id}))
          const proposition = response.data.getProposition
          propositions.push({id: proposition.id, index: position.index, content: proposition.content})
        }
      })
    } catch {
      throw 'no such proposition'
    }
    return propositions
  }
)

// export const fetchPropositions = createAsyncThunk(
//   'propositions/fetchPropositions', async () => {
//     console.log('fetching...')
//     const response = await API.graphql(graphqlOperation(queries.listPropositions))
//     response.data.listPropositions.items.sort((a,b) => a.index - b.index)
//     return response.data.listPropositions.items
//   }
// )

// export const createProposition = createAsyncThunk(
//   'propositions/createProposition', async (proposition) => {
//     const input = {input: {discussionPropositionsId}}
//     console.log('input', input)
//     const response = await API.graphql(graphqlOperation(mutations.createProposition, input))
//     const newProposition = response.data.createProposition
//     newProposition.nanoid = proposition.nanoid
//     return newProposition
//   }
// )

// export function focusOnPropositionThunk(newIndex) {
//   return (dispatch, getState) => {
//     const state = getState()
//     let proposition = state.propositions.items.find(proposition => newIndex === proposition.index)
//     if (!proposition) {
//       proposition = newProposition(nanoid(), newIndex)
//       dispatch(createProposition(proposition))
//     }
//     dispatch(propositionsSlice.actions.focusOnProposition(proposition.index))
//   }
// }

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

// export const selectPropositions = state => state.propositions.items
// export const selectPropositionsStatus = state => state.propositions.status
// export const {updateProposition} = propositionsSlice.actions
export default discussionsSlice.reducer
