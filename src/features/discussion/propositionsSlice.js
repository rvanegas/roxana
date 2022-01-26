import { createSlice, nanoid } from '@reduxjs/toolkit'

function newProposition(index) {
  return {id: nanoid(), index, content: ''}
}

export const propositionsSlice = createSlice({
  name: 'propositions',
  initialState: [newProposition(0)],
  reducers: {
    updateProposition(state, action) {
      // payload: {id, content} or {index, autoFocus}
      const key = action.payload.id !== undefined ? 'id' : 'index'
      const proposition = state.find(proposition => action.payload[key] === proposition[key])
      Object.assign(proposition, action.payload)
      if (proposition.autoFocus === false) delete proposition.autoFocus
      if (Boolean(state[state.length - 1].content)) {
        state.push(newProposition(state.length))
      }
    }
  }
})

export const selectPropositions = state => state.propositions
export const {updateProposition} = propositionsSlice.actions

export default propositionsSlice.reducer
