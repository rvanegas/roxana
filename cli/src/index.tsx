import {DynamoDBClient, DescribeTableCommand, ListTablesCommand,
  ScanCommand} from '@aws-sdk/client-dynamodb'
import {AppSyncClient, ListGraphqlApisCommand, GetGraphqlApiCommand} from '@aws-sdk/client-appsync'

const client = new DynamoDBClient({region: 'us-west-2'})
const clientAppSync = new AppSyncClient({region: 'us-west-2'})

async function getGraphqlApi() {
  // pebbles
  const command = new GetGraphqlApiCommand({apiId: 'bqkpkb6pszhoxpd3urdmd775km'})
  try {
    const results = await clientAppSync.send(command)
    console.log(results)
  } catch (err) {
    console.error(err)
  }
}

async function listApis() {
  const command = new ListGraphqlApisCommand({})
  try {
    const results = await clientAppSync.send(command)
    console.log(results)
  } catch (err) {
    console.error(err)
  }
}

async function tables() {
  const command = new ListTablesCommand({});
  try {
    const results = await client.send(command);
    console.log(results.TableNames.join("\n"));
  } catch (err) {
    console.error(err);
  }
}

async function scanUsers() {
  // User-u7epzlbjkngxjlz5cpiql2qium-roxana
  const command = new ScanCommand({TableName: 'User-u7epzlbjkngxjlz5cpiql2qium-roxana'})
  try {
    const results = await client.send(command);
    console.log(results.Items.map(item => item.username.S));
  } catch (err) {
    console.error(err);
  }
}

async function describeTable() {
  const command = new ScanCommand({TableName: 'DiscussionUsers-bqkpkb6pszhoxpd3urdmd775km-pebbles'})
  try {
    const results = await client.send(command);
    console.log(results.Items[0]);
  } catch (err) {
    console.error(err);
  }
}

async function addDiscussUser() {
  // User-u7epzlbjkngxjlz5cpiql2qium-roxana
  const command = new ScanCommand({TableName: 'DiscussionUsers-bqkpkb6pszhoxpd3urdmd775km-pebbles'})
  try {
    const results = await client.send(command);
    console.log(results.Items.map(item => item.username.S));
  } catch (err) {
    console.error(err);
  }
}

// describeTable()
// tables()
// scanUsers();

// npx tsc index.tsx && node index.js

// listApis()
getGraphqlApi()
