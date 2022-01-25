import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import { propositionsSlice } from '../features/discussion/propositionsSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    propositions: propositionsSlice.reducer,
  }
})

const { addProposition } = propositionsSlice.actions
store.dispatch(addProposition('Foo'))
store.dispatch(addProposition('Bar'))

// propositionsAdapter.addOne({position: 1, content: 'Foo'})
// propositionsAdapter.addOne({position: 2, content: 'Bar'})
// console.log(propositionsAdapter.getInitialState())

// import { configureStore } from '@reduxjs/toolkit'
// import { propositionsSlice } from '../features/discussion/propositionsSlice'

// console.log('p', propositionsSlice.reducer)

// export const store = configureStore({
//   reducer: {
//     propositions: propositionsSlice.reducer
//   }
// })
