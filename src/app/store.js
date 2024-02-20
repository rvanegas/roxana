import { configureStore } from '@reduxjs/toolkit'
import discussionsReducer from '../features/discussion/discussionsSlice'
import argumentsReducer from '../features/discussion/argumentsSlice'

export const store = configureStore({
  reducer: {
    discussions: discussionsReducer,
    arguments: argumentsReducer,
  }
})
