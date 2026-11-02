#!/usr/bin/env node
import { DynamoDBClient, ScanCommand, DeleteItemCommand,
  QueryCommand, UpdateItemCommand, PutItemCommand, ScanCommandInput, ScanCommandOutput } from '@aws-sdk/client-dynamodb'
import { readFileSync, realpathSync } from 'fs'
import { pathToFileURL } from 'url'

const db = new DynamoDBClient({ region: 'us-west-2' })

const ENV = 'roxana'
const API_ID = 'ogl3fer6ojag7awhbu33p664va'
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
    ProjectionExpression: 'id, userId',
  }))
  const userDiscussions = (udResult.Items ?? []).map(u => ({ id: u.id?.S ?? '', userId: u.userId?.S ?? '' }))

  console.log(`Discussion:   ${id}`)
  console.log(`Sentences:    ${sentenceIds.length}`)
  console.log(`Participants: ${userDiscussions.map(u => u.userId).join(', ') || 'none'}`)

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
  for (const ud of userDiscussions) {
    await db.send(new DeleteItemCommand({
      TableName: table('UserDiscussion'),
      Key: { id: { S: ud.id } },
    }))
  }

  console.log('Deleted.')
}

async function publishDiscussion() {
  const id = process.argv[3]
  if (!id) {
    console.error('Usage: roxana publish <id>')
    process.exit(1)
  }

  await db.send(new UpdateItemCommand({
    TableName: table('Discussion'),
    Key: { id: { S: id } },
    UpdateExpression: 'SET isPrivate = :f',
    ExpressionAttributeValues: { ':f': { BOOL: false } },
    ConditionExpression: 'attribute_exists(id)',
  }))
  console.log(`Discussion ${id} is now public.`)
}

async function scanAll(input: ScanCommandInput) {
  const items: NonNullable<ScanCommandOutput['Items']> = []
  let ExclusiveStartKey: ScanCommandOutput['LastEvaluatedKey']
  do {
    const result = await db.send(new ScanCommand({ ...input, ExclusiveStartKey }))
    items.push(...(result.Items ?? []))
    ExclusiveStartKey = result.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

// A person is their noesis user name since Roxana signs in through noesis; one
// who was known here by another name (a Cognito username, or two of them) is
// renamed to it everywhere a name is kept: User, UserDiscussion.userId, and in
// each discussion's layout the sentences' owner, accepted, rejected, cleared
// and goal, and analyzingState.username.
const NOESIS_NAME = /^[a-z0-9][a-z0-9_-]*$/
const VOTES = ['accepted', 'rejected', 'cleared'] as const

export function parseRenames(text: string): Map<string, string> {
  const renames = new Map<string, string>()
  const lines = text.split('\n')
  lines.forEach((raw, i) => {
    const line = raw.split('\t#')[0].trim()
    if (!line || line.startsWith('#')) return
    const [from, to] = line.split('\t').map(part => part.trim())
    const where = `line ${i + 1}`
    if (!from || !to) throw new Error(`${where}: not \`old<TAB>new\``)
    if (!NOESIS_NAME.test(to)) throw new Error(`${where}: ${to} is not a noesis user name`)
    if (from === to) throw new Error(`${where}: ${from} is renamed to itself`)
    if (renames.has(from)) throw new Error(`${where}: ${from} is renamed twice`)
    renames.set(from, to)
  })
  for (const [from, to] of renames) {
    if (renames.has(to)) throw new Error(`${from} -> ${to}, which is itself renamed: name the last one`)
  }
  return renames
}

// The layout with its names renamed, and what a merge of two names had to
// decide: when a person voted on a sentence under two names, the vote under
// the name they keep wins, else the name listed first.
export function renameLayout(layout: string, renames: Map<string, string>) {
  const parsed = JSON.parse(layout)
  const order = [...renames.keys()]
  const rank = (name: string) => renames.has(name) ? 1 + order.indexOf(name) : 0
  const notes: string[] = []
  let changed = false
  for (const section of ['propositions', 'arguments']) {
    for (const entry of parsed[section] ?? []) {
      if (entry.owner && renames.has(entry.owner)) {
        entry.owner = renames.get(entry.owner)
        changed = true
      }
      const votes = new Map<string, {vote: string, from: string}>()
      for (const vote of VOTES) {
        for (const name of entry[vote] ?? []) {
          const to = renames.get(name) ?? name
          if (to !== name) changed = true
          const held = votes.get(to)
          if (held && held.vote !== vote) {
            const keep = rank(name) < rank(held.from) ? {vote, from: name} : held
            notes.push(`${section} ${entry.index}: ${to} was ${held.vote} as ${held.from} and ${vote} as ${name}; ${keep.vote} kept`)
            votes.set(to, keep)
          } else if (!held || rank(name) < rank(held.from)) {
            votes.set(to, {vote, from: name})
          }
        }
      }
      for (const vote of VOTES) {
        if (entry[vote] === undefined) continue
        const kept = (entry[vote] as string[]).map(name => renames.get(name) ?? name)
          .filter((to, i, all) => votes.get(to)?.vote === vote && all.indexOf(to) === i)
        entry[vote] = kept
      }
      if (entry.goal) {
        const goal = (entry.goal as string[]).map(name => renames.get(name) ?? name)
        if (goal.some((to, i) => to !== entry.goal[i])) changed = true
        entry.goal = goal.filter((to, i) => goal.indexOf(to) === i)
      }
    }
  }
  return {layout: changed ? JSON.stringify(parsed) : layout, changed, notes}
}

async function renameUsers() {
  const file = process.argv[3]
  const confirmed = process.argv.includes('--confirm')
  if (!file) {
    console.error('Usage: roxana rename <file of old<TAB>new lines> [--confirm]')
    process.exit(1)
  }
  const renames = parseRenames(readFileSync(file, 'utf8'))
  const known = new Set((await scanAll({ TableName: table('User') })).map(item => item.username?.S ?? ''))
  for (const [from, to] of renames) {
    const state = known.has(from) ? '' : '  (not a Roxana user: nothing under this name)'
    const merge = known.has(to) ? `  (${to} is already a Roxana user: merged)` : ''
    console.log(`${from} -> ${to}${state}${merge}`)
  }

  // Each discussion's layout and analyzingState; its revision is bumped, so a
  // browser holding the old one reloads rather than writing it back.
  const discussions = await scanAll({ TableName: table('Discussion') })
  const updates: {id: string, revision: string, layout: string, analyzingState?: string}[] = []
  for (const item of discussions) {
    const id = item.id?.S ?? ''
    const {layout, changed, notes} = renameLayout(item.layout?.S ?? '{}', renames)
    let analyzingState = item.analyzingState?.S
    let stateChanged = false
    if (analyzingState) {
      const state = JSON.parse(analyzingState)
      if (state?.username && renames.has(state.username)) {
        state.username = renames.get(state.username)
        analyzingState = JSON.stringify(state)
        stateChanged = true
      }
    }
    if (!changed && !stateChanged) continue
    updates.push({id, revision: item.revision?.N ?? '0', layout, ...(stateChanged ? {analyzingState} : {})})
    console.log(`discussion ${id}: renamed${stateChanged ? ', analyzingState too' : ''}`)
    for (const note of notes) console.log(`  ${note}`)
  }

  // Participation: one row per discussion and person, the newest kept.
  const rows = (await scanAll({ TableName: table('UserDiscussion') })).map(item => ({
    id: item.id?.S ?? '', userId: item.userId?.S ?? '', discussionId: item.discussionId?.S ?? '',
    updatedAt: item.updatedAt?.S ?? '',
  }))
  const byKey = new Map<string, typeof rows>()
  for (const row of rows) {
    const key = `${row.discussionId}\t${renames.get(row.userId) ?? row.userId}`
    byKey.set(key, [...(byKey.get(key) ?? []), row])
  }
  const relabel: {id: string, userId: string}[] = []
  const drop: string[] = []
  for (const [key, group] of byKey) {
    if (!group.some(row => renames.has(row.userId))) continue
    const to = key.split('\t')[1]
    group.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const [keep, ...rest] = group
    if (keep.userId !== to) relabel.push({id: keep.id, userId: to})
    drop.push(...rest.map(row => row.id))
  }
  console.log(`participation: ${relabel.length} row(s) renamed, ${drop.length} duplicate(s) removed`)
  // A User for the new name only where an old one was a user: first sign-in makes the rest.
  const toCreate = [...new Set([...renames].filter(([from]) => known.has(from)).map(([, to]) => to))]
    .filter(to => !known.has(to))
  const toDelete = [...renames.keys()].filter(from => known.has(from))
  console.log(`users: ${toCreate.length} created (${toCreate.join(', ') || 'none'}), ` +
    `${toDelete.length} removed (${toDelete.join(', ') || 'none'})`)

  if (!confirmed) {
    console.log('\nDry run — pass --confirm to rename.')
    return
  }

  const now = new Date().toISOString()
  for (const to of toCreate) {
    await db.send(new PutItemCommand({
      TableName: table('User'),
      Item: { username: { S: to }, __typename: { S: 'User' }, createdAt: { S: now }, updatedAt: { S: now } },
      ConditionExpression: 'attribute_not_exists(username)',
    }))
  }
  for (const {id, userId} of relabel) {
    await db.send(new UpdateItemCommand({
      TableName: table('UserDiscussion'),
      Key: { id: { S: id } },
      UpdateExpression: 'SET userId = :u',
      ExpressionAttributeValues: { ':u': { S: userId } },
      ConditionExpression: 'attribute_exists(id)',
    }))
  }
  for (const id of drop) {
    await db.send(new DeleteItemCommand({ TableName: table('UserDiscussion'), Key: { id: { S: id } } }))
  }
  for (const {id, revision, layout, analyzingState} of updates) {
    const next = String(Number(revision) + 1)
    await db.send(new UpdateItemCommand({
      TableName: table('Discussion'),
      Key: { id: { S: id } },
      UpdateExpression: `SET layout = :l, revision = :next${analyzingState ? ', analyzingState = :a' : ''}`,
      ConditionExpression: 'revision = :rev',
      ExpressionAttributeValues: {
        ':l': { S: layout }, ':next': { N: next }, ':rev': { N: revision },
        ...(analyzingState ? { ':a': { S: analyzingState } } : {}),
      },
    }))
  }
  for (const from of toDelete) {
    await db.send(new DeleteItemCommand({ TableName: table('User'), Key: { username: { S: from } } }))
  }
  console.log('Renamed.')
}

const commands: Record<string, () => Promise<void>> = {
  discussions: listDiscussions,
  users:       listUsers,
  delete:      deleteDiscussion,
  publish:     publishDiscussion,
  rename:      renameUsers,
}

const cmd = process.argv[2]
// Run as the CLI, not when imported for its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main()

function main() {
if (!cmd || !commands[cmd]) {
  console.error(`Usage: roxana <command>\n\nCommands:\n  ${Object.keys(commands).join('\n  ')}`)
  process.exit(1)
}

commands[cmd]().catch(err => { console.error(err); process.exit(1) })
}
