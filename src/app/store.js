import { configureStore } from '@reduxjs/toolkit'
import propositionsReducer from '../features/discussion/propositionsSlice'
import discussionsReducer from '../features/discussion/discussionsSlice'
import argumentsReducer from '../features/discussion/argumentsSlice'

export const store = configureStore({
  reducer: {
    propositions: propositionsReducer,
    discussions: discussionsReducer,
    arguments: argumentsReducer,
  }
})
