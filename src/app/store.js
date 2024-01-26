import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import propositionsReducer from '../features/discussion/propositionsSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    propositions: propositionsReducer,
  }
})
