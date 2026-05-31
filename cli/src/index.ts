import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

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

const commands: Record<string, () => Promise<void>> = {
  discussions: listDiscussions,
  users:       listUsers,
}

const cmd = process.argv[2]
if (!cmd || !commands[cmd]) {
  console.error(`Usage: roxana <command>\n\nCommands:\n  ${Object.keys(commands).join('\n  ')}`)
  process.exit(1)
}

commands[cmd]().catch(err => { console.error(err); process.exit(1) })
