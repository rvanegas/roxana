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

const listPropositions = gql`
  query ListPropositions {
    listPropositions {
      items {
        id
        index
        content
      }
    }
  }
`

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

exports.handler = async (event) => {
  try {
    const graphqlData = await axios({
      url: process.env.API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT,
      method: 'post',
      headers: {
        'x-api-key': process.env.API_ROXANA_GRAPHQLAPIKEYOUTPUT
      },
      data: {
        query: print(updateProposition),
        variables: {
          input: {
            id: 'ad3aa273-1d9b-4a3f-b028-0b091b7d09d3',
            content: 'new value'
          }
        }
      }
    });
    return JSON.stringify(graphqlData)
  } catch (err) {
    console.log('error posting to appsync: ', err);
  }
}
