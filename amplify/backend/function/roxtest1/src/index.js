/* Amplify Params - DO NOT EDIT
	API_ROXANA_GRAPHQLAPIENDPOINTOUTPUT
	API_ROXANA_GRAPHQLAPIIDOUTPUT
	API_ROXANA_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

exports.handler = async (event, context) => {
    const response = JSON.stringify({
        hello: 'Hello from Lambda!',
        event: event,
        context: context
    })
    return response;
};
