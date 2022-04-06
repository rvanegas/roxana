import React from 'react'
import {useDispatch} from 'react-redux'
import {View} from '@aws-amplify/ui-react'
import {
  clearSentenceModal,
} from './discussionsSlice'

export function SentenceModal() {
  const dispatch = useDispatch()

  function handleOverlay() {
    dispatch(clearSentenceModal())
  }

  return (
    <View columnStart={1} columnEnd={4} className="sentence-modal-wrapper">
      <View className="sentence-modal">
        <View style={{marginTop: '45px'}}>
          hey i'm a modal
        </View>
      </View>
      <View
        className="sentence-modal-overlay"
        onClick={handleOverlay}
      />
    </View>
  )
}
