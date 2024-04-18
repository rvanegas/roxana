import {configureStore} from '@reduxjs/toolkit'
import {discussionsSlice} from '../features/discussion/discussionsSlice'

export const store = configureStore({
  reducer: {
    discussions: discussionsSlice.reducer,
  }
})
