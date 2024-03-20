import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, nanoid} from '@reduxjs/toolkit'
import Cookies from 'universal-cookie'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'
import {dlog, pick} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {
  discussionIdFromUrl,
  redirectToDiscussionId,
  generateDiscussionId,
  incrementDiscussionIdLength,
  hoursAgo,
} from '../../app/util'

const cookies = new Cookies()
const cookieKey = 'roxanaDiscussionId'

interface Event {
  handler: string
  payload: any
}

interface State {
  eventQueue: Event[]
  status: string
  error?: string
  discussionId?: string
  username?: string
  revision?: number
  propositions: Sentence[]
  arguments: Sentence[]
  discussants: string[]
  isCompact: boolean
}

const initialState: State = {
  eventQueue: [] as Event[],
  status: 'init',
  error: undefined,
  discussionId: undefined,
  username: undefined,
  revision: undefined,
  propositions: [],
  arguments: [],
  discussants: [],
  isCompact: false,
}

function updateSentenceDerivatives(state) {
  const discussants = new Set<string>()
  const sentences = state.propositions.concat(state.arguments)
  for (let sentence of sentences) {
    const claimants = sentence.accepted.concat(sentence.rejected)
    for (let claimant of claimants) {
      discussants.add(claimant)
    }
  }
  state.discussants = Array.from(discussants)

  const indexes = new Set<number>()
  for (let argument of state.arguments) {
    for (let index of propositionIndexesFromArgument(argument)) {
      indexes.add(index)
    }
  }
  for (let index = 1; index <= state.propositions.length; index++) {
    state.propositions[index-1].inArgument = indexes.has(index)
  }

  for (let argument of state.arguments) {
    argument.irrational = []
    const indexes = propositionIndexesFromArgument(argument)
    const propositions = indexes.map(index => state.propositions[index-1])
    if (propositions.length !== 0) {
      const premises = propositions.slice(0, -1)
      const conclusion = propositions.slice(-1)[0]
      for (let discussant of state.discussants) {
        const irrational = premises.every(p => p.accepted.includes(discussant))
          && conclusion.rejected.includes(discussant)
          && argument.accepted.includes(discussant)
        if (irrational) {
          argument.irrational.push(discussant)
        }
      }
    }
  }
}

const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    initialize(state, action) {
      const discussionId: string = action.payload
      Object.assign(state, {discussionId, revision: 0, propositions: [], arguments: []})
    },
    setIsCompact(state, action) {
      const isCompact: boolean = action.payload
      state.isCompact = isCompact
    },
    incrementRevision(state, action) {
      const revision: number = action.payload
      if (state.revision && state.revision + 1 !== revision) {
        dlog.warn('revisions', state.revision, revision)
        throw new Error('bad revision increment')
      }
      dlog('revision local', revision)
      state.revision = revision
    },
    addSentence(state, action) {
      const {section, key}: {section: Section, key: string} = action.payload
      const sentence: Sentence = {
        key, content: '', index: nextIndex(state[section]),
        status: 'draft', owner: state.username,
        accepted: [], rejected: [], irrational: [],
        inArgument: false
      }
      state[section].push(sentence)
    },
    setFocus(state, action) {
      const {section, position}: {section: Section, position: number} = action.payload
      state[section][position].autoFocus = true
    },
    unsetFocus(state, action) {
      const {section, position}: {section: Section, position: number} = action.payload
      delete state[section][position].autoFocus
    },
    setStatus(state, action) {
      state.status = action.payload
    },
    setUsername(state, action) {
      const username: string = action.payload
      state.username = username
    },
    eventEnqueue(state, action) {
      const event: Event = action.payload
      state.eventQueue.push(event)
    },
    eventDequeue(state, action) {
      state.eventQueue.shift()
    },
    updateSentence(state, action) {
      const {section, newSentence}: {section: Section, newSentence: Sentence} = action.payload
      const sentence = state[section].find(p => p.key === newSentence.key)
      if (sentence) {
        Object.assign(sentence, newSentence)
      }
      updateSentenceDerivatives(state)
    },
    updateSentences(state, action) {
      function mergeInNewSentences(section: Section) {
        const unsavedSentences = state[section].filter(s => !s.id)
        const base = nextIndex(newSentences[section])
        const reindexedUnsavedSentences = unsavedSentences.map((sentence, i) => {
          sentence.index = base + i;
          return sentence
        })
        state[section] = newSentences[section].concat(reindexedUnsavedSentences)
      }
      const {revision, newSentences}: {revision: number, newSentences: Sentence[]} = action.payload
      state.revision = revision
      mergeInNewSentences('propositions')
      mergeInNewSentences('arguments')
      updateSentenceDerivatives(state)
      dlog('revision remote', revision)
    }
  }
})

function nextIndex(sentences: Sentence[]): number {
  return sentences.reduce((max, p) => Math.max(max, p.index), 0) + 1
}
function nextUniqueIndex(sentence: Sentence, sentences: Sentence[]): number {
  const indexUnique = sentences.filter(p => p.index === sentence.index).length === 1
  return indexUnique ? sentence.index : nextIndex(sentences)
}

function updateDiscussionLayout(changeNote: string) {
  const {incrementRevision} = discussionsSlice.actions
  const sentenceProperties = ['index', 'id', 'status', 'owner', 'accepted', 'rejected']
  const makeLayoutEntry = sentence => pick(sentence, sentenceProperties)
  const layoutFilter = sentence => sentence.id !== undefined
  const sentencesToEntries = sentences => sentences.filter(layoutFilter).map(makeLayoutEntry)
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const layout = JSON.stringify({
        propositions: sentencesToEntries(state.discussions.propositions),
        arguments: sentencesToEntries(state.discussions.arguments)
      })
      const id = state.discussions.discussionId
      const version = 2
      const oldRevision = state.discussions.revision
      const revision = oldRevision + 1
      const variables = {
        input: {id, version, revision, layout},
        condition: {revision: {eq: oldRevision}}
      }
      dlog('updateLayout begin', revision, changeNote)
      await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
      dlog('updateLayout end', revision, changeNote)
      dispatch(incrementRevision(revision))
    }
    catch (exception: any) {
      const errorType = exception.errors ? exception.errors[0].errorType : null
      if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
        const newException = new Error()
        newException.name = 'UnexpectedLayoutRevision'
        throw newException
      }
      else {
        throw exception
      }
    }
  }
}

export interface GetDiscussionInput {
  id: string,
  revision?: number,
  layout?: string,
  version?: number,
  updatedAt?: any,
  sentences?: any
}

function getDiscussion(discussion: GetDiscussionInput) {
  const {updateSentences} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const newSentences = {propositions: [], arguments: []}
    let sentences: Sentence[] = []
    let layoutEntries
    let layoutUpdated

    async function parseLayout() {
      if (!discussion.layout) {
        throw new Error('missing layout')
      }
      layoutEntries = JSON.parse(discussion.layout)
      for (let entry of layoutEntries.propositions.concat(layoutEntries.arguments)) {
        const invalidEntry = typeof entry.id !== 'string'
          || typeof entry.index !== 'number'
          || typeof entry.status !== 'string'
          || (entry.status === 'draft' && typeof entry.owner !== 'string')
          || (Array.isArray(entry.accepted) && entry.accepted.some(a => typeof a !== 'string'))
          || (Array.isArray(entry.rejected) && entry.rejected.some(a => typeof a !== 'string'))
        if (invalidEntry) {
          console.error('entry', entry)
          throw new Error('invalid entry')
        }
      }
    }

    async function loadDiscussion() {
      const input = {id: discussion.id}
      const response = await API.graphql(graphqlOperation(custom.getDiscussionSimple, input)) as any
      discussion = response.data.getDiscussion
      if (!discussion) {
        throw new Error('no such discussion')
      }
      sentences = discussion.sentences.items
    }

    async function getSentence(id) {
      const response = await API.graphql(graphqlOperation(queries.getSentence, {id})) as any
      return response.data.getSentence
    }

    async function readLayout(section) {
      const expireIdleDrafts = hoursAgo(discussion.updatedAt) > 1
      const stateSentences = state.discussions[section]
      for (let pos = 0; pos < layoutEntries[section].length; pos++) {
        const layoutEntry = layoutEntries[section][pos]
        const sentence = stateSentences.find(s => s.id === layoutEntry.id)
          || sentences.find(s => s.id === layoutEntry.id)
          || await getSentence(layoutEntry.id)
        if (!sentence) {
          throw new Error('invalid sentence id, fixing layout')
        }
        const notUnique = newSentences[section].some(s => s.id === sentence.id)
        if (notUnique) {
          throw new Error('non-unique sentence id, fixing layout')
        }
        const newSentence: Sentence = {
          id: sentence.id,
          key: sentence.key || nanoid(),
          index: layoutEntry.index,
          content: sentence.content,
          status: layoutEntry.status,
          owner: layoutEntry.owner,
          accepted: layoutEntry.accepted || [],
          rejected: layoutEntry.rejected || [],
          irrational: [],
          inArgument: false
        }
        if (newSentence.status === 'draft' && expireIdleDrafts) {
          newSentence.status = 'committed'
          newSentence.owner = undefined
          layoutUpdated = true
        }
        newSentences[section].push(newSentence)
      }
    }

    const state = getState()
    if (state.discussions.discussionId && state.discussions.discussionId !== discussion.id) {
      return // ignore updates from other discussions
    }
    if (discussion.revision && discussion.revision <= state.discussions.revision) {
      return
    }
    if (!discussion.layout) {
      await loadDiscussion()
    }
    if (!discussion.revision || discussion.version !== 2) {
      console.error('version', discussion)
      throw new Error('bad version')
    }
    await parseLayout()
    await readLayout('propositions')
    await readLayout('arguments')
    dispatch(updateSentences({revision: discussion.revision, newSentences}))
    if (layoutUpdated) {
      await dispatch(updateDiscussionLayout('expire commits'))
    }
  }
}

function initializeDiscussion() {
  const {initialize} = discussionsSlice.actions
  return async (dispatch, getState) => {
    let discussionId = discussionIdFromUrl()
    if (discussionId) {
      cookies.set(cookieKey, discussionId)
    }
    else {
      discussionId = cookies.get(cookieKey)
      if (discussionId) {
        redirectToDiscussionId(discussionId)
      }
      else {
        await dispatch(createNewDiscussionAction())
      }
      return
    }
    try {
      dispatch(initialize(discussionId))
      await dispatch(getDiscussion({id: discussionId}))
    }
    catch {
      await dispatch(createNewDiscussionAction())
      return
    }
    if (getState().discussions.propositions.length === 0) {
      await dispatch(addNewSentence('propositions'))
    }
    if (getState().discussions.arguments.length === 0) {
      await dispatch(addNewSentence('arguments'))
    }
  }
}

function createNewDiscussion() {
  return async (dispatch) => {
    const layout = JSON.stringify({propositions: [], arguments: []})
    const revision = 1
    const version = 2
    const variables = {input: {version, layout, revision}} as {input: {id, version, layout, revision}}
    for (;;) {
      try {
        const discussionId = generateDiscussionId()
        variables.input.id = discussionId
        await API.graphql(graphqlOperation(mutations.createDiscussion, variables))
        cookies.set(cookieKey, discussionId)
        redirectToDiscussionId(discussionId)
        break
      }
      catch (exception: any) {
        const errorType = exception.errors ? exception.errors[0].errorType : null
        if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
          // console.log('failed create, retrying...')
          incrementDiscussionIdLength()
        }
        else {
          throw exception
        }
      }
    }
  }
}

export interface ReplaceSentenceInput {
  key: string
  section: Section
  content: string
}

function replaceSentence(input: ReplaceSentenceInput) {
  const {key, section, content} = input
  const {updateSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const discussionId = state.discussions.discussionId
      let discussionSentences = {
        propositions: state.discussions.propositions,
        arguments: state.discussions.arguments,
      }
      const sentences = discussionSentences[section]
      const sentence = sentences.find(s => s.key === key)
      if (!sentence) {
        console.error('not found', key, section, discussionSentences)
        throw new Error('sentence not found')
      }
      const variables = {input: {content, discussionId}}
      const response = await API.graphql(graphqlOperation(mutations.createSentence, variables)) as any
      const newSentenceId = response.data.createSentence.id
      const index = nextUniqueIndex(sentence, sentences)
      const {status, owner} = sentence
      const newSentence = {key, index, content, id: newSentenceId, status, owner}
      //// duplicated - begin
      dispatch(updateSentence({section, newSentence}))
      await dispatch(updateDiscussionLayout('replace'))
      //// duplicated - end
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision') {
        console.warn('try again')
        dispatch(replaceSentenceAction({key, section, content}))
      }
      else {
        throw exception
      }
    }
  }
}

export const isActionable = {
  edit: (sentence: Sentence, username: string) => sentence.status === 'committed' && !sentence.inArgument
    && sentence.accepted.length === 0 && sentence.rejected.length === 0,
  commit: (sentence: Sentence, username: string) => sentence.status === 'draft'
    && sentence.owner === username,
  accept: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && !sentence.accepted.includes(username),
  reject: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && !sentence.rejected.includes(username),
  clear: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && (sentence.accepted.includes(username) || sentence.rejected.includes(username)),
}

interface ChangeSentenceStatusInput {
  key: string
  section: Section
  change: 'edit' | 'commit' | 'accept' | 'reject' | 'clear'
}

function changeSentenceStatus(input: ChangeSentenceStatusInput) {
  const {key, section, change} = input
  const {updateSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const username = state.discussions.username
      let discussionSentences = {
        propositions: state.discussions.propositions,
        arguments: state.discussions.arguments,
      }
      const sentences = discussionSentences[section]
      const sentence = sentences.find(s => s.key === key)
      if (!sentence) {
        console.error('not found', key, section, discussionSentences)
        throw new Error('sentence not found')
      }
      let newSentence: Sentence
      if (change === 'edit' && isActionable.edit(sentence, username)) {
        newSentence = {...sentence, status: 'draft', owner: username}
      }
      else if (change === 'commit' && isActionable.commit(sentence, username)) {
        newSentence = {...sentence, status: 'committed', owner: undefined}
      }
      else if (change === 'accept' && isActionable.accept(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        newAccepted.add(username)
        newRejected.delete(username)
        newSentence = {...sentence, accepted: Array.from(newAccepted), rejected: Array.from(newRejected)}
      }
      else if (change === 'reject' && isActionable.reject(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        newRejected.add(username)
        newAccepted.delete(username)
        newSentence = {...sentence, accepted: Array.from(newAccepted), rejected: Array.from(newRejected)}
      }
      else if (change === 'clear' && isActionable.clear(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        newAccepted.delete(username)
        newRejected.delete(username)
        newSentence = {...sentence, accepted: Array.from(newAccepted), rejected: Array.from(newRejected)}
      }
      else {
        console.warn('unknown action or invalid conditions:', change, sentence)
        return
      }
      //// duplicated - begin
      dispatch(updateSentence({section, newSentence}))
      await dispatch(updateDiscussionLayout(change))
      //// duplicated - end
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision') {
        console.warn('try again')
        dispatch(changeSentenceStatus(input))
      }
      else {
        throw exception
      }
    }
  }
}

function addNewSentence(section: Section) {
  const {addSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const key = nanoid()
    dispatch(addSentence({section, key}))
    const input: ReplaceSentenceInput = {key, section, content: ''}
    dispatch(replaceSentenceAction(input))
  }
}

const eventHandlerFunctions = {
  createNewDiscussion,
  initializeDiscussion,
  getDiscussion,
  replaceSentence,
  changeSentenceStatus,
}

function enqueueEvent(action) {
  const {setStatus, eventEnqueue, eventDequeue} = discussionsSlice.actions
  if (!action.handler) {
    throw new Error('unknown handler', action.handler)
  }
  return async (dispatch, getState) => {
    dispatch(eventEnqueue(action))
    const status = getState().discussions.status
    if (status === 'idle' || status === 'init') {
      dispatch(setStatus('updating'))
      let event
      for (;;) {
        event = getState().discussions.eventQueue[0]
        if (!event) {
          break
        }
        const handler = eventHandlerFunctions[event.handler]
        await dispatch(handler(event.payload))
        dispatch(eventDequeue(null))
      }
      dispatch(setStatus('idle'))
    }
  }
}

export function createNewDiscussionAction() {
  const action = {handler: 'createNewDiscussion'}
  return dispatch => dispatch(enqueueEvent(action))
}
export function initializeDiscussionAction() {
  const action = {handler: 'initializeDiscussion'}
  return dispatch => dispatch(enqueueEvent(action))
}
export function getDiscussionAction(discussion) {
  const action = {handler: 'getDiscussion', payload: discussion}
  return dispatch => dispatch(enqueueEvent(action))
}
export function replaceSentenceAction(value: ReplaceSentenceInput) {
  const action = {handler: 'replaceSentence', payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeSentenceStatusAction(value: ChangeSentenceStatusInput) {
  const action = {handler: 'changeSentenceStatus', payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}

export function focusOnSentence(section: Section, position: number) {
  const {setFocus} = discussionsSlice.actions
  return async (dispatch, getState) => {
    let state = getState()
    if (state.discussions[section].length < position) {
      throw new Error('position too high')
    }
    let sentence = state.discussions[section][position]
    if (!sentence) {
      await dispatch(addNewSentence(section))
    }
    dispatch(setFocus({section, position}))
  }
}

export function propositionIndexesFromArgument(argument) {
  return argument.content ? argument.content.split(' ').map(i => parseInt(i)) : []
}

export const selectDiscussions = state => state.discussions
export const {unsetFocus, setUsername, setIsCompact} = discussionsSlice.actions
export default discussionsSlice.reducer
