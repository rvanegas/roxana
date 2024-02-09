const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

/* Amplify Params - DO NOT EDIT
	API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT
	API_ROXANA_GRAPHQLAPIIDOUTPUT
	API_ROXANA_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const updateProposition = gql`
  mutation UpdateProposition(
    $input: UpdatePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    updateProposition(input: $input, condition: $condition) {
      id
      index
      content
      createdAt
      updatedAt
    }
  }
`

async function writeIndex(id, index) {
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
  });
  return JSON.stringify(graphqlData)
}

exports.handler = async event => {
  try {
    //eslint-disable-line
    console.log(JSON.stringify(event, null, 2));
    if (!event.Records) return;
    for (let record of event.Records) {
      console.log(record.eventID);
      console.log(record.eventName);
      console.log('DynamoDB Record: %j', record.dynamodb);
      if (!record.dynamodb.OldImage) {
        await writeIndex(record.dynamodb.Keys.id.S, 10)
      }
    }
    return Promise.resolve('Successfully processed DynamoDB record');
  } catch (err) {
    console.log('error posting to appsync: ', err);
  }
};
