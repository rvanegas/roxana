import { DynamoDBClient, ScanCommand, DeleteItemCommand,
  QueryCommand } from '@aws-sdk/client-dynamodb'

const db = new DynamoDBClient({ region: 'us-west-2' })

const ENV = 'roxana'
const API_ID = 'u7epzlbjkngxjlz5cpiql2qium'
const table = (name: string) => `${name}-${API_ID}-${ENV}`

async function listDiscussions() {
  const result = await db.send(new ScanCommand({ TableName: table('Discussion') }))
  const items = (result.Items ?? []).map(item => ({
    id:           item.id?.S ?? '',
    updatedAt:    item.updatedAt?.S ?? '',
    revision:     item.revision?.N ?? '0',
    isPrivate:    item.isPrivate?.BOOL ? 'private' : 'public',
    goalsSummary: item.goalsSummary?.S ?? '',
  }))
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  for (const d of items) {
    const date = d.updatedAt.slice(0, 10)
    const summary = d.goalsSummary.length > 60
      ? d.goalsSummary.slice(0, 57) + '...'
      : d.goalsSummary.padEnd(60)
    console.log(`${d.id}  ${date}  r${d.revision.padStart(3)}  ${d.isPrivate.padEnd(7)}  ${summary}`)
  }
  console.log(`\n${items.length} discussion(s)`)
}

async function listUsers() {
  const result = await db.send(new ScanCommand({ TableName: table('User') }))
  const usernames = (result.Items ?? []).map(item => item.username?.S ?? '').sort()
  for (const u of usernames) {
    console.log(u)
  }
  console.log(`\n${usernames.length} user(s)`)
}

async function deleteDiscussion() {
  const id = process.argv[3]
  const confirmed = process.argv.includes('--confirm')

  if (!id) {
    console.error('Usage: roxana delete <id> [--confirm]')
    process.exit(1)
  }

  // Find sentences belonging to this discussion
  const sentenceResult = await db.send(new ScanCommand({
    TableName: table('Sentence'),
    FilterExpression: 'discussionId = :id',
    ExpressionAttributeValues: { ':id': { S: id } },
    ProjectionExpression: 'id',
  }))
  const sentenceIds = (sentenceResult.Items ?? []).map(s => s.id?.S ?? '')

  // Find UserDiscussion entries for this discussion
  const udResult = await db.send(new ScanCommand({
    TableName: table('UserDiscussion'),
    FilterExpression: 'discussionId = :id',
    ExpressionAttributeValues: { ':id': { S: id } },
    ProjectionExpression: 'discussionId, userId',
  }))
  const userDiscussions = (udResult.Items ?? []).map(u => u.userId?.S ?? '')

  console.log(`Discussion:   ${id}`)
  console.log(`Sentences:    ${sentenceIds.length}`)
  console.log(`Participants: ${userDiscussions.join(', ') || 'none'}`)

  if (!confirmed) {
    console.log('\nDry run — pass --confirm to delete.')
    return
  }

  await db.send(new DeleteItemCommand({
    TableName: table('Discussion'),
    Key: { id: { S: id } },
  }))
  for (const sid of sentenceIds) {
    await db.send(new DeleteItemCommand({
      TableName: table('Sentence'),
      Key: { id: { S: sid } },
    }))
  }
  for (const userId of userDiscussions) {
    await db.send(new DeleteItemCommand({
      TableName: table('UserDiscussion'),
      Key: { discussionId: { S: id }, userId: { S: userId } },
    }))
  }

  console.log('Deleted.')
}

const commands: Record<string, () => Promise<void>> = {
  discussions: listDiscussions,
  users:       listUsers,
  delete:      deleteDiscussion,
}

const cmd = process.argv[2]
if (!cmd || !commands[cmd]) {
  console.error(`Usage: roxana <command>\n\nCommands:\n  ${Object.keys(commands).join('\n  ')}`)
  process.exit(1)
}

commands[cmd]().catch(err => { console.error(err); process.exit(1) })
