import {pick} from 'lodash'
import {Sentence} from './discussion.d'

export function parseDiscussionLayout(layout: string) {
  if (!layout) {
    throw new Error('missing layout')
  }
  const parsedLayout = JSON.parse(layout)
  for (let entry of parsedLayout.propositions.concat(parsedLayout.arguments)) {
    const invalidEntry = typeof entry.id !== 'string'
      || typeof entry.index !== 'number'
      || typeof entry.status !== 'string'
      || (entry.status === 'draft' && typeof entry.owner !== 'string')
      || (Array.isArray(entry.accepted) && entry.accepted.some(a => typeof a !== 'string'))
      || (Array.isArray(entry.rejected) && entry.rejected.some(a => typeof a !== 'string'))
      || (Array.isArray(entry.cleared) && entry.cleared.some(a => typeof a !== 'string'))
      || (Array.isArray(entry.goal) && entry.goal.some(a => typeof a !== 'string'))
      || (entry.hidden !== undefined && typeof entry.hidden !== 'boolean')
    if (invalidEntry) {
      console.error('entry', entry)
      throw new Error('invalid entry')
    }
  }
  return parsedLayout
}

export function createDiscussionLayout(args: {propositions: Sentence[], arguments: Sentence[]}) {
  const sentenceProperties = ['index', 'id', 'status', 'owner', 'accepted', 'rejected', 'cleared', 'goal', 'hidden']
  const makeLayoutEntry = sentence => pick(sentence, sentenceProperties)
  const layoutFilter = sentence => sentence.id !== undefined
  const sentencesToEntries = sentences => sentences.filter(layoutFilter).map(makeLayoutEntry)
  const layout = JSON.stringify({
    propositions: sentencesToEntries(args.propositions),
    arguments: sentencesToEntries(args.arguments)
  })
  return layout
}

export function createNewDiscussionLayout() {
  return JSON.stringify({propositions: [], arguments: []})
}

export function newSentenceFromLayoutEntry(sentence, layoutEntry) {
  const newSentence: Sentence = {
    id: sentence.id,
    index: layoutEntry.index,
    content: sentence.content,
    status: layoutEntry.status,
    owner: layoutEntry.owner,
    accepted: layoutEntry.accepted || [],
    rejected: layoutEntry.rejected || [],
    cleared: layoutEntry.cleared || [],
    goal: layoutEntry.goal || [],
    hidden: layoutEntry.hidden,
    irrational: [],
    inArgument: false
  }
  return newSentence
}
