import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

const discussionPropositionsId = '613f30f4-f43d-46ca-80a8-a3e98eda8b07'

function newProposition(id, index) {
  const proposition = {
    id,
    nanoid: id,
    index,
    content: '',
    discussionPropositionsId
  }
  if (index === 0) proposition.autoFocus = true
  return proposition
}

const initialState = {
  items: [],
  status: 'idle',
  error: null
}

export const propositionsSlice = createSlice({
  name: 'propositions',
  initialState: initialState,
  reducers: {
    updateProposition(state, action) {
      const proposition = state.items.find(proposition => action.payload.id === proposition.id)
      if (proposition) {
        Object.assign(proposition, action.payload)
        if (proposition.autoFocus === false) delete proposition.autoFocus
      } else {
        state.items.push(action.payload)
      }
    },
    focusOnProposition(state, action) {
      const newIndex = action.payload
      const proposition = state.items.find(proposition => newIndex === proposition.index)
      proposition.autoFocus = true
    },
    clearPropositions(state, action) {
      Object.assign(state, initialState)
      state.status = 'clearing'
    },
    clearingDone(state, action) {
      state.status = 'idle'
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPropositions.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPropositions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPropositions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(createProposition.pending, (state, action) => {
        state.items.push(action.meta.arg)
      })
      .addCase(createProposition.fulfilled, (state, action) => {
        const newProposition = action.payload
        const proposition = state.items.find(proposition => newProposition.nanoid === proposition.nanoid)
        if (proposition) {
          proposition.id = newProposition.id
          delete proposition.nanoid
        }
      })
      .addCase(createProposition.rejected, (state, action) => {
        console.log('rejected create', action)
      })
  }
})

export const fetchPropositions = createAsyncThunk(
  'propositions/fetchPropositions', async () => {
    console.log('fetching...')
    const response = await API.graphql(graphqlOperation(queries.listPropositions))
    response.data.listPropositions.items.sort((a,b) => a.index - b.index)
    return response.data.listPropositions.items
  }
)

export const createProposition = createAsyncThunk(
  'propositions/createProposition', async (proposition) => {
    const input = {input: {discussionPropositionsId}}
    console.log('input', input)
    const response = await API.graphql(graphqlOperation(mutations.createProposition, input))
    const newProposition = response.data.createProposition
    newProposition.nanoid = proposition.nanoid
    return newProposition
  }
)

export function focusOnPropositionThunk(newIndex) {
  return (dispatch, getState) => {
    const state = getState()
    let proposition = state.propositions.items.find(proposition => newIndex === proposition.index)
    if (!proposition) {
      proposition = newProposition(nanoid(), newIndex)
      dispatch(createProposition(proposition))
    }
    dispatch(propositionsSlice.actions.focusOnProposition(proposition.index))
  }
}

export function clearPropositionsThunk() {
  return async (dispatch, getState) => {
    console.log('clearing...')
    const state = getState()
    const propositionIds = state.propositions.items.map(proposition => proposition.id)
    dispatch(propositionsSlice.actions.clearPropositions())
    const deletePromises = propositionIds.map(id =>
      API.graphql(graphqlOperation(mutations.deleteProposition, {input: {id}}))
    )
    await Promise.all(deletePromises)
    dispatch(propositionsSlice.actions.clearingDone())
  }
}

export const selectPropositions = state => state.propositions.items
export const selectPropositionsStatus = state => state.propositions.status
export const {updateProposition} = propositionsSlice.actions
export default propositionsSlice.reducer
