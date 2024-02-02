import {createSlice, nanoid} from '@reduxjs/toolkit'

function newProposition(index) {
  const proposition = {id: nanoid(), index, content: ''}
  if (index === 0) proposition.autoFocus = true
  return proposition
}

export const propositionsSlice = createSlice({
  name: 'propositions',
  initialState: [newProposition(0)],
  reducers: {
    updateProposition(state, action) {
      const proposition = state.find(proposition => action.payload.id === proposition.id)
      Object.assign(proposition, action.payload)
      if (proposition.autoFocus === false) delete proposition.autoFocus
    },
    focusOnProposition(state, action) {
      const newIndex = action.payload
      let proposition = state.find(proposition => newIndex === proposition.index)
      if (!proposition) {
        proposition = newProposition(state.length)
        state.push(proposition)
      }
      proposition.autoFocus = true
    }
  }
})

export const selectPropositions = state => state.propositions
export const {updateProposition, focusOnProposition} = propositionsSlice.actions
export default propositionsSlice.reducer
