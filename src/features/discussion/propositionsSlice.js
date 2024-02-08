import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
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
      .addCase(createProposition.fulfilled, (state, action) => {
        console.log('fulfilled create', action)
      })
      .addCase(createProposition.rejected, (state, action) => {
        console.log('rejected create', action)
      })
  }
})

export const fetchPropositions = createAsyncThunk(
  'propositions/fetchPropositions', async () => {
    const response = await API.graphql(graphqlOperation(queries.listPropositions))
    return response.data
  }
)

export const createProposition = createAsyncThunk(
  'propositions/createProposition', async () => {
    const input = {content: 'newer value'}
    const response = await API.graphql(graphqlOperation(mutations.createProposition, {input}))
    return response.data
  }
)

export const selectPropositions = state => state.propositions.items
export const selectPropositionsStatus = state => state.propositions.status
export const {updateProposition, focusOnProposition} = propositionsSlice.actions
export default propositionsSlice.reducer
