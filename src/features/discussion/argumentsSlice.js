import {createSlice, nanoid} from '@reduxjs/toolkit'

function newArgument(index) {
  return {id: nanoid(), index, propositionIds: []}
}

function toAlphaIndex(numberIndex) {
  const divisor = 26
  const base = 'A'.charCodeAt()
  let alphas = []
  while (numberIndex >= 0) {
    const remainder = numberIndex % divisor
    alphas.unshift(String.fromCharCode(remainder + base))
    numberIndex = (numberIndex - remainder) / divisor - 1
  }
  return alphas.join('')
}

export const argumentsSlice = createSlice({
  name: 'arguments',
  initialState: [newArgument(toAlphaIndex(0))],
  reducers: {
    updateArgument(state, action) {
      // payload: {id, content}
      const argument = state.find(argument => action.payload.id === argument.id)
      Object.assign(argument, action.payload)
      if (state[state.length - 1].propositionIds.length > 0) {
        state.push(newArgument(toAlphaIndex(state.length)))
      }
    }
  }
})

export const selectArguments = state => state.arguments
export const {updateArgument} = argumentsSlice.actions
export default argumentsSlice.reducer
