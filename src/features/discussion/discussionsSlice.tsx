import {API, graphqlOperation} from 'aws-amplify'
import {createSlice, nanoid} from '@reduxjs/toolkit'
import Cookies from 'universal-cookie'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'
import {pick} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {
  discussionIdFromUrl,
  redirectToDiscussionId,
  generateDiscussionId,
  incrementDiscussionIdLength
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
  version?: number
  propositions: Sentence[]
  arguments: Sentence[]
}

const initialState: State = {
  eventQueue: [] as Event[],
  status: 'init',
  error: undefined,
  discussionId: undefined,
  username: undefined,
  version: undefined,
  propositions: [],
  arguments: [],
}

function setPropositionArguments(propositions: Sentence[], arguments_: Sentence[]) {
  const ids = new Set<string>()
  for (let argument of arguments_) {
    for (let id of propositionIdsFromArgument(argument)) {
      ids.add(id)
    }
  }
  for (let proposition of propositions) {
    proposition.inArgument = proposition.id ? ids.has(proposition.id) : false
  }
}

const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    initialize(state, action) {
      const discussionId: string = action.payload
      Object.assign(state, {discussionId, version: 0, propositions: [], arguments: []})
    },
    incrementVersion(state, action) {
      const version: number = action.payload
      if (state.version && version !== state.version + 1) {
        throw new Error('bad version increment')
      }
      state.version = version
    },
    addSentence(state, action) {
      const {section, key}: {section: Section, key: string} = action.payload
      const sentence: Sentence = {
        key, content: '', index: nextIndex(state[section]),
        status: 'draft', owner: state.username,
        accepted: [], rejected: [],
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
      setPropositionArguments(state.propositions, state.arguments)
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
      const {version, newSentences}: {version: number, newSentences: Sentence[]} = action.payload
      state.version = version
      mergeInNewSentences('propositions')
      mergeInNewSentences('arguments')
      setPropositionArguments(state.propositions, state.arguments)
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

function updateDiscussionLayout({layout, isReset}) {
  const {incrementVersion} = discussionsSlice.actions
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const id = state.discussions.discussionId
      const oldVersion = state.discussions.version
      const version = oldVersion + 1
      const variables = {
        input: {id, layout, version},
        version: {layout: {eq: {oldVersion}}},
      }
      await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
      dispatch(incrementVersion(version))
    }
    catch (exception: any) {
      const errorType = exception.errors ? exception.errors[0].errorType : null
      if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
        const newException = new Error()
        newException.name = 'UnexpectedLayoutVersion'
        throw newException
      }
      else {
        throw exception
      }
    }
  }
}

interface GetDiscussionInput {
  discussionId: string,
  layout?: string,
  version?: number,
}

function getDiscussion({discussionId, layout, version}: GetDiscussionInput) {
  const {updateSentences} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const newSentences = {propositions: [], arguments: []}
    let currentSentences = [] as Sentence[]
    let discussion
    let layoutEntries

    async function resetLayout(message) {
      await dispatch(updateDiscussionLayout({layout: JSON.stringify(layoutEntries), isReset: true}))
      // discussion will reload in response to update event picked up by discussion subscription
      console.error('system error: ', message)
      dispatch(getDiscussionAction({discussionId}))
      throw new Error('resetLayout')
    }

    async function parseLayout() {
      try {
        if (!layout) {
          throw new Error('missing layout')
        }
        layoutEntries = JSON.parse(layout)
        for (let entry of layoutEntries.propositions.concat(layoutEntries.arguments)) {
          const invalidEntry = typeof entry.id !== 'string'
            || typeof entry.index !== 'number'
            || typeof entry.status !== 'string'
            || (entry.status === 'draft' && typeof entry.owner !== 'string')
          if (invalidEntry) {
            throw new Error('invalid entry')
          }
        }
      }
      catch {
        layoutEntries = {propositions: [], arguments: []}
        await resetLayout('invalid layout, parse error')
      }
    }

    async function loadDiscussion() {
      const input = {id: discussionId}
      const response = await API.graphql(graphqlOperation(custom.getDiscussionSimple, input)) as any
      discussion = response.data.getDiscussion
      if (!discussion) {
        throw new Error('no such discussion')
      }
      currentSentences = discussion.currentSentences.items
      version = discussion.version
      layout = discussion.layout
    }

    async function getSentence(id) {
      const response = await API.graphql(graphqlOperation(queries.getSentence, {id})) as any
      return response.data.getSentence
    }

    async function removeSentence(section, pos, message) {
      layoutEntries[section].splice(pos, 1)
      await resetLayout(message)
    }

    async function readLayout(section) {
      const stateSentences = state.discussions[section]
      for (let pos = 0; pos < layoutEntries[section].length; pos++) {
        const layoutEntry = layoutEntries[section][pos]
        const sentence = stateSentences.find(s => s.id === layoutEntry.id)
          || currentSentences.find(s => s.id === layoutEntry.id)
          || await getSentence(layoutEntry.id)
        if (!sentence) {
          await removeSentence(section, pos, 'invalid sentence id, fixing layout')
        }
        const notUnique = newSentences[section].some(s => s.id === sentence.id)
        if (notUnique) {
          await removeSentence(section, pos, 'non-unique sentence id, fixing layout')
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
          inArgument: false
        }
        newSentences[section].push(newSentence)
      }
    }

    const state = getState()
    if (state.discussions.discussionId && state.discussions.discussionId !== discussionId) {
      throw new Error('not implemented')
    }
    if (version && version <= state.discussions.version) {
      return
    }

    try {
      if (!layout) {
        await loadDiscussion()
      }
      await parseLayout()
      await readLayout('propositions')
      await readLayout('arguments')
      dispatch(updateSentences({version, newSentences}))
    }
    catch (exception: any) {
      if (exception.message !== 'resetLayout') {
        throw exception
      }
    }
  }
}

function initializeDiscussion({discussionId}) {
  const {initialize} = discussionsSlice.actions
  return async (dispatch, getState) => {
    if (discussionId) {
      throw new Error("found discussionId")
    }
    if (!discussionId) {
      discussionId = discussionIdFromUrl()
      if (discussionId) {
        cookies.set(cookieKey, discussionId)
      }
    }
    if (!discussionId) {
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
      await dispatch(getDiscussion({discussionId}))
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
    const version = 1
    const variables = {input: {layout, version}} as {input: {id, layout, version}}
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
      const variables = {input: {content, discussionId, currentDiscussionId: discussionId}}
      const response = await API.graphql(graphqlOperation(mutations.createSentence, variables)) as any
      const newSentenceId = response.data.createSentence.id
      const index = nextUniqueIndex(sentence, sentences)
      const {status, owner} = sentence
      const newSentence = {key, index, content, id: newSentenceId, status, owner}
      const layoutSentences = sentences.map(s => s.key === newSentence.key ? newSentence : s)
      discussionSentences[section] = layoutSentences
      discussionSentences = {
        propositions: discussionSentences.propositions.filter(s => s.id),
        arguments: discussionSentences.arguments.filter(s => s.id),
      }
      //// duplicated - begin
      const sentenceProperties = ['index', 'id', 'status', 'owner', 'accepted', 'rejected']
      const makeLayoutEntry = sentence => pick(sentence, sentenceProperties)
      const layout = JSON.stringify({
        propositions: discussionSentences.propositions.map(makeLayoutEntry),
        arguments: discussionSentences.arguments.map(makeLayoutEntry)
      })
      await dispatch(updateDiscussionLayout({layout, isReset: false}))
      dispatch(updateSentence({section, newSentence}))
      //// duplicated - end
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutVersion') {
        console.warn('try again')
        dispatch(replaceSentenceAction({key, section, content}))
      }
      else {
        throw exception
      }
    }
  }
}

interface ChangeSentenceStatusInput {
  key: string
  section: Section
  change: 'edit' | 'commit' | 'accept' | 'reject'
}

function changeSentenceStatus(input: ChangeSentenceStatusInput) {
  const {key, section, change} = input
  const {updateSentence} = discussionsSlice.actions
  const isEditable = s => (s.accepted.length === 0 && s.rejected.length === 0 && !s.inArgument)
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
      if (change === 'edit' && sentence.status === 'committed' && isEditable(sentence)) {
        newSentence = {...sentence, status: 'draft', owner: username}
      }
      else if (change === 'commit' && sentence.status === 'draft') {
        newSentence = {...sentence, status: 'committed', owner: undefined}
      }
      else if (change === 'accept' && sentence.status === 'committed') {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        newAccepted.has(username) ? newAccepted.delete(username) : newAccepted.add(username)
        newRejected.delete(username)
        newSentence = {...sentence, accepted: Array.from(newAccepted), rejected: Array.from(newRejected)}
      }
      else if (change === 'reject' && sentence.status === 'committed') {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        newRejected.has(username) ? newRejected.delete(username) : newRejected.add(username)
        newAccepted.delete(username)
        newSentence = {...sentence, accepted: Array.from(newAccepted), rejected: Array.from(newRejected)}
      }
      else {
        console.warn('unknown action or invalid conditions:', change, sentence)
        return
      }
      const layoutSentences = sentences.map(s => s.key === newSentence.key ? newSentence : s)
      discussionSentences[section] = layoutSentences
      //// duplicated - begin
      const sentenceProperties = ['index', 'id', 'status', 'owner', 'accepted', 'rejected']
      const makeLayoutEntry = sentence => pick(sentence, sentenceProperties)
      const layout = JSON.stringify({
        propositions: discussionSentences.propositions.map(makeLayoutEntry),
        arguments: discussionSentences.arguments.map(makeLayoutEntry)
      })
      await dispatch(updateDiscussionLayout({layout, isReset: false}))
      dispatch(updateSentence({section, newSentence}))
      //// duplicated - end
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutVersion') {
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
export function initializeDiscussionAction(discussion) {
  const action = {handler: 'initializeDiscussion', payload: discussion}
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

export function propositionIdsFromArgument(argument) {
  return argument.content ? argument.content.split(' ') : []
}

export const selectDiscussions = state => state.discussions
export const {unsetFocus, setUsername} = discussionsSlice.actions
export default discussionsSlice.reducer
