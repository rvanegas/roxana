import { configureStore } from '@reduxjs/toolkit'
import discussionsReducer from '../features/discussion/discussionsSlice'

export const store = configureStore({
  reducer: {
    discussions: discussionsReducer,
  }
})
