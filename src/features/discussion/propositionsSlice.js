import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit'
import {listPropositions, echo} from '../../graphql/queries'

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
      .addCase(echoTest.fulfilled, (state, action) => {
        console.log('action', JSON.parse(action.payload.echo))
      })
  }
})

export const echoTest = createAsyncThunk(
  'propositions/echo', async (message, ThunkAPI) => {
    const response = await API.graphql(graphqlOperation(echo, message))
    return response.data
  }
)

export const fetchPropositions = createAsyncThunk(
  'propositions/fetchPropositions', async () => {
    const response = await API.graphql(graphqlOperation(listPropositions))
    return response.data
  }
)

export const selectPropositions = state => state.propositions.items
export const {updateProposition, focusOnProposition} = propositionsSlice.actions
export default propositionsSlice.reducer
