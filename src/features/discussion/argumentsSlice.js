import {createSlice, nanoid} from '@reduxjs/toolkit'

function newArgument(index) {
  return {id: nanoid(), index, propositionIds: []}
}

export const argumentsSlice = createSlice({
  name: 'arguments',
  initialState: [newArgument(1)],
  reducers: {
    updateArgument(state, action) {
      const argument = state.find(argument => action.payload.id === argument.id)
      Object.assign(argument, action.payload)
      if (argument.autoFocus === false) delete argument.autoFocus
    },
    focusOnArgument(state, action) {
      const newIndex = action.payload
      let argument = state.find(argument => newIndex === argument.index)
      if (!argument) {
        argument = newArgument(state.length)
        state.push(argument)
      }
      argument.autoFocus = true
    }
  }
})

export const selectArguments = state => state.arguments
export const {updateArgument, focusOnArgument} = argumentsSlice.actions
export default argumentsSlice.reducer
