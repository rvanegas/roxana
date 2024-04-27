import {DynamoDBClient, ListTablesCommand, ScanCommand} from '@aws-sdk/client-dynamodb'

// npx tsc index.tsx && node index.js

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

scanUsers();
