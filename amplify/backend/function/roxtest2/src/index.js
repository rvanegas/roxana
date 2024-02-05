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

exports.handler = async (event) => {
  try {
    const graphqlData = await axios({
      url: process.env.API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT,
      method: 'post',
      headers: {
        'x-api-key': process.env.API_ROXANA_GRAPHQLAPIKEYOUTPUT
      },
      data: {
        query: print(listPropositions),
      }
    });
    return JSON.stringify(graphqlData.data.data.listPropositions)
  } catch (err) {
    console.log('error posting to appsync: ', err);
  }
}
