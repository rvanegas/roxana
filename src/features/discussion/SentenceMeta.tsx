import React from 'react'
import {Button, View, Text} from '@aws-amplify/ui-react'

export function SentenceMeta({sentence}) {
  let statusLine = `status: ${sentence.status}`
  if (sentence.owner) {
    statusLine += `, owner: ${sentence.owner}`
  }

  return (
    <React.Fragment>
      <View columnSpan={2} style={{placeSelf: 'center end'}}>
        <Button variation="link" size="small">c</Button>
        <Button variation="link" size="small">a</Button>
        <Button variation="link" size="small">r</Button>
      </View>
      <View columnSpan={2}>
        <Text alignSelf="center" style={{justifySelf: 'start', lineHeight: '40px'}}>
          {statusLine}
        </Text>
      </View>
    </React.Fragment>
  )
}
