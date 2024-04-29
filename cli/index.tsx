import {DynamoDBClient, DescribeTableCommand, ListTablesCommand, ScanCommand} from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({region: 'us-west-2'})

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

