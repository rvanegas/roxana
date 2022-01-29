import { configureStore } from '@reduxjs/toolkit'
import propositionsReducer from '../features/discussion/propositionsSlice'
import argumentsReducer from '../features/discussion/argumentsSlice'

export const store = configureStore({
  reducer: {
    propositions: propositionsReducer,
    arguments: argumentsReducer,
  }
})
