const axios = require('axios')
const gql = require('graphql-tag')
const graphql = require('graphql')
const {print} = graphql

/* Amplify Params - DO NOT EDIT
	API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT
	API_ROXANA_GRAPHQLAPIIDOUTPUT
	API_ROXANA_GRAPHQLAPIKEYOUTPUT
	AUTH_ROXANA31481408_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const discussionId = '613f30f4-f43d-46ca-80a8-a3e98eda8b07'

const getDiscussion = gql`
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      nextPropositionIndex
      createdAt
      updatedAt
    }
  }
`

const updateDiscussion = gql`
  mutation UpdateDiscussion {
    updateDiscussion(input: $input) {
      id
      nextPropositionIndex
      createdAt
      updatedAt
    }
  }
`

const updateProposition = gql`
  mutation UpdateProposition {
    updateProposition(input: $input) {
      id
      index
      content
      createdAt
      updatedAt
    }
  }
`

async function readNextPropositionIndex() {
  const graphqlData = await axios({
    url: process.env.API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT,
    method: 'post',
    headers: {
      'x-api-key': process.env.API_ROXANA_GRAPHQLAPIKEYOUTPUT
    },
    data: {
      query: print(getDiscussion),
      variables: {
        id: discussionId,
      }
    }
  })
  console.log('discussion', graphqlData.data.data)
  return graphqlData.data.data.getDiscussion.nextPropositionIndex
}

async function writeNextPropositionIndex(index) {
  const graphqlData = await axios({
    url: process.env.API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT,
    method: 'post',
    headers: {
      'x-api-key': process.env.API_ROXANA_GRAPHQLAPIKEYOUTPUT
    },
    data: {
      query: print(updateDiscussion),
      variables: {
        input: {
          id: discussionId,
          index: index
        }
      }
    }
  })
  console.log('writeNextPropositionIndex', graphqlData.data)
}

async function writeIndex(id, index) {
  console.log('write inputs', id, index, typeof index)
  const graphqlData = await axios({
    url: process.env.API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT,
    method: 'post',
    headers: {
      'x-api-key': process.env.API_ROXANA_GRAPHQLAPIKEYOUTPUT
    },
    data: {
      query: print(updateProposition),
      variables: {
        input: {id, index}
      }
    }
  })
  console.log('writeIndex', graphqlData)
}

async function writeIndexes(newPropositionIds) {
  console.log('IDs', newPropositionIds)
  const nextIndex = await readNextPropositionIndex()
  const writePromises = newPropositionIds.map((id, offset) => {
    console.log('iter', id, nextIndex, offset)
    writeIndex(id, nextIndex + offset)
  })
  writePromises.push(writeNextPropositionIndex(nextIndex + newPropositionIds.length))
  console.log('promises', writePromises)
  await Promise.all(writePromises)
  console.log('after "all"')
}

exports.handler = async (event) => {
  try {
    const newPropositionIds = []

    console.log('event', JSON.stringify(event, null, 2))
    if (!event.Records) return
    for (let record of event.Records) {
      console.log('eventID', record.eventID)
      console.log('eventName', record.eventName)
      console.log('DynamoDB Record: %j', record.dynamodb)
      if (!record.dynamodb.OldImage) {
        newPropositionIds.push(record.dynamodb.Keys.id.S)
      }
    }
    await writeIndexes(newPropositionIds)
    console.log("after write")

    return Promise.resolve('Successfully processed DynamoDB record')
  } catch (err) {
    console.log('error posting to appsync: ', err)
  }
}
