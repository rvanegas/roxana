import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
import {roxtest2, roxtest4} from '../../graphql/queries'
import {createProposition} from '../../graphql/mutations'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'

function newProposition(index) {
  const proposition = {id: nanoid(), index, content: ''}
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
      Object.assign(proposition, action.payload)
      if (proposition.autoFocus === false) delete proposition.autoFocus
    },
    focusOnProposition(state, action) {
      const newIndex = action.payload
      let proposition = state.items.find(proposition => newIndex === proposition.index)
      if (!proposition) {
        proposition = newProposition(state.items.length)
        state.items.push(proposition)
      }
      proposition.autoFocus = true
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPropositions.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPropositions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.concat(action.payload.listPropositions.items)
      })
      .addCase(fetchPropositions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(roxtest2Action.fulfilled, (state, action) => {
        console.log('rox2', JSON.parse(action.payload.roxtest2))
      })
      .addCase(roxtest4Action.fulfilled, (state, action) => {
        console.log('rox4', JSON.parse(action.payload.roxtest4))
      })
      .addCase(createPropositionAction.fulfilled, (state, action) => {
        console.log('create', JSON.parse(action.payload))
      })
      .addCase(createPropositionAction.rejected, (state, action) => {
        console.log('rejected create', action)
      })
      .addCase(updatePropositionAction.fulfilled, (state, action) => {
        console.log('update', JSON.parse(action))
      })
      .addCase(updatePropositionAction.rejected, (state, action) => {
        console.log('rejected update', action)
      })
  }
})

export const roxtest2Action = createAsyncThunk(
  'propositions/roxtest2', async () => {
    const response = await API.graphql(graphqlOperation(roxtest2))
    return response.data
  }
)

export const roxtest4Action = createAsyncThunk(
  'propositions/roxtest4', async (msg) => {
    const response = await API.graphql(graphqlOperation(roxtest4, msg))
    return response.data
  }
)

export const fetchPropositions = createAsyncThunk(
  'propositions/fetchPropositions', async () => {
    const response = await API.graphql(graphqlOperation(queries.listPropositions))
    return response.data
  }
)

export const createPropositionAction = createAsyncThunk(
  'propositions/createProposition', async () => {
    console.log('creating...')
    const response = await API.graphql(graphqlOperation(createProposition))
    return response.data
  }
)

export const updatePropositionAction = createAsyncThunk(
  'propositions/updateProposition', async () => {
    console.log('updating...')
    const id = '5a066cf3-bb44-476a-baec-070c9249c7b3'
    const index = 4
    const input = {id, index}
    const response = await API.graphql(graphqlOperation(mutations.updateProposition, {input}))
    return response.data
  }
)

export const selectPropositions = state => state.propositions.items
export const selectPropositionsStatus = state => state.propositions.status
export const {updateProposition, focusOnProposition} = propositionsSlice.actions
export default propositionsSlice.reducer
