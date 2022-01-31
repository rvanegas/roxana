import {createSlice, nanoid} from '@reduxjs/toolkit'

function newArgument(index) {
  return {id: nanoid(), index, propositionIds: []}
}

export const argumentsSlice = createSlice({
  name: 'arguments',
  initialState: [newArgument(1)],
  reducers: {
    updateArgument(state, action) {
      // payload: {id, content}
      const argument = state.find(argument => action.payload.id === argument.id)
      Object.assign(argument, action.payload)
      if (Boolean(state[state.length - 1].content)) {
        state.push(newArgument(state.length))
      }
    }
    // updateProposition(state, action) {
    //   // payload: {id, content} or {index, autoFocus}
    //   const key = action.payload.id !== undefined ? 'id' : 'index'
    //   const proposition = state.find(proposition => action.payload[key] === proposition[key])
    //   Object.assign(proposition, action.payload)
    //   if (proposition.autoFocus === false) delete proposition.autoFocus
    //   if (Boolean(state[state.length - 1].content)) {
    //     state.push(newProposition(state.length))
    //   }
    // }
  }
})

// export const selectArguments = state => {
//   if (state.propositions.length < 4) {
//     return;
//   } else if (state.propositions.length < 6) {
//     return (
//       [
//         {
//           id: 'oiireuhfiwehf',
//           index: 'A',
//           propositionIds: [state.propositions[0].id, state.propositions[1].id, state.propositions[2].id]
//         }
//       ]
//     )
//   } else {
//     return (
//       [
//         {
//           id: 'oiireuhfiwehf',
//           index: 'A',
//           propositionIds: [state.propositions[0].id, state.propositions[1].id, state.propositions[2].id]
//         },
//         {
//           id: 'bcwyehkiwnef',
//           index: 'B',
//           propositionIds: [state.propositions[2].id, state.propositions[1].id, state.propositions[0].id]
//         }
//       ]
//     )
//   }
// }

export const selectArguments = state => state.arguments

// export const {} = argumentsSlice.actions
export default argumentsSlice.reducer
