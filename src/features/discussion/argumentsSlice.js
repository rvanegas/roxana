import {createSlice, nanoid} from '@reduxjs/toolkit'

function newArgument(index) {
  return {id: nanoid(), index, content: ''}
}

export const argumentsSlice = createSlice({
  name: 'arguments',
  initialState: [newArgument('A')],
  reducers: {
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

export const selectArguments = state => {
  if (state.propositions.length < 4) return;
  return (
    [
      {
        id: 'oiireuhfiwehf',
        index: 'A',
        premiseIds: [state.propositions[0].id, state.propositions[1].id],
        conclusionId: state.propositions[2].id
      },
      {
        id: 'bcwyehkiwnef',
        index: 'B',
        premiseIds: [state.propositions[2].id, state.propositions[1].id],
        conclusionId: state.propositions[0].id
      }
    ]
  )
}

// export const {} = argumentsSlice.actions
export default argumentsSlice.reducer
