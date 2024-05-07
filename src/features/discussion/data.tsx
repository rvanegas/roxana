import {API, graphqlOperation} from 'aws-amplify'
import {nanoid} from '@reduxjs/toolkit'
import {pick, sortBy, reverse, concat} from 'lodash'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'
import {dlog, hoursAgo, isPresent,
  generateDiscussionId, generateInviteCode} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {createDiscussionLayout, createNewDiscussionLayout,
  newSentenceFromLayoutEntry, parseDiscussionLayout} from './layout'
import {discussionsSlice, nextUniqueIndex, sentenceCommittedOthers} from './discussionsSlice'

let tryAgainTrials = 0
const tryAgainTrialsMax = 6

function updateDiscussionLayout(changeNote: string) {
  const {incrementRevision} = discussionsSlice.actions
  function getGoalsSummary(discussions) {
    const goals = discussions.propositions.map((p, index) => ({index, length: p.goal.length}))
    const filteredGoals = goals.filter(s => s.length > 0)
    const sortedGoals = reverse(sortBy(reverse(filteredGoals), 'length'))
    const summary = sortedGoals.map(s => {
      const proposition = discussions.propositions[s.index]
      const users = proposition.goal.join(', ')
      const contentPattern = /^\s*(.*?)\.*\s*$/
      const matches = proposition.content.match(contentPattern)
      const content = matches[1]
      return `${content} (${users})`
    }).join(' \u2014 ') // emdash
    return summary
  }
  async function updateUserDiscussions(discussionId) {
    const getVariables = {discussionId}
    console.log('ud1', discussionId, getVariables)
    const response = await API.graphql(graphqlOperation(queries.queryUserDiscussionByDiscussionId, getVariables)) as {data}
    console.log('ud2', discussionId, response)
    for (let item of response.data.queryUserDiscussionByDiscussionId.items) {
      console.log('item', item)
    }
  }
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const layout = createDiscussionLayout(pick(state.discussions, ['propositions', 'arguments']))
      const id = state.discussions.discussionId
      const version = 2
      const oldRevision = state.discussions.revision
      const revision = oldRevision + 1
      const goalsSummary = getGoalsSummary(state.discussions)
      // gql requires null (not undefined or empty string) to clear invite code
      const inviteCode = state.discussions.inviteCode || null
      const variables = {
        input: {id, version, revision, layout, goalsSummary, inviteCode},
        condition: {revision: {eq: oldRevision}}
      }
      await API.graphql(graphqlOperation(mutations.updateDiscussion, variables))
      updateUserDiscussions(id)
      dlog('updateLayout', revision, changeNote)
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

function addNewSentence(section: Section, status: string) {
  const {addSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const key = nanoid()
    dispatch(addSentence({section, key, status}))
    dispatch(replaceSentenceAction({key, section, content: ''}))
  }
}

function createNewDiscussion({isPrivate}) {
  const {setNewDiscussionId} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const id = ''
    const version = 2
    const revision = 1
    const layout = createNewDiscussionLayout()
    const variables = {input: {id, version, revision, isPrivate, layout}}
    let discussionId
    for (;;) {
      try {
        discussionId = generateDiscussionId()
        variables.input.id = discussionId
        await API.graphql(graphqlOperation(mutations.createDiscussion, variables))
        dispatch(setNewDiscussionId(discussionId))
        break
      }
      catch (exception: any) {
        const errorType = exception.errors ? exception.errors[0].errorType : null
        if (errorType === 'DynamoDB:ConditionalCheckFailedException') {
          console.log('failed create, retrying...')
        }
        else {
          throw exception
        }
      }
    }
    const state = getState()
    const userVariables = {input: {discussionId, userId: state.discussions.username}}
    if (isPrivate) {
      await API.graphql(graphqlOperation(mutations.createUserDiscussion, userVariables))
    }
  }
}

function initializeDiscussion({discussionId}) {
  const {initialize} = discussionsSlice.actions
  return async (dispatch, getState) => {
    try {
      dispatch(initialize(discussionId))
      await dispatch(getDiscussion({id: discussionId}))
      if (getState().discussions.propositions.length === 0) {
        await dispatch(addNewSentence('propositions', 'committed'))
      }
    }
    catch (exception: any) {
      if (exception.name === 'GetDiscussionError') {
        console.error('get discussion failed: ', exception.message)
      }
      else {
        throw exception
      }
    }
  }
}

function GetDiscussionError(this: {message: string, stack: any}, message: string) {
  this.message = message
  this.stack = Error().stack
}
GetDiscussionError.prototype = Object.create(Error.prototype)
GetDiscussionError.prototype.name = 'GetDiscussionError'

function getDiscussion(discussionInput: {id: string})
function getDiscussion(discussionInput: {id: string, withoutSentences: true})
function getDiscussion(discussionInput: {
  id: string,
  revision: number,
  layout: string,
  version: number,   // needed?
  updatedAt: string  // needed?
})
function getDiscussion(discussionInput) {
  const {updateDiscussion} = discussionsSlice.actions
  return async (dispatch, getState) => {

    let discussion : {
      id: string,
      revision: number,
      layout: string,
      version: number,
      updatedAt: string,
      isPrivate: boolean,
      inviteCode: string,
      userDiscussions: {items: object[]},
    }
    let sentences: Sentence[] = []

    const newSentences = {propositions: [], arguments: []}
    let parsedLayout
    let layoutUpdated

    async function loadDiscussion() {
      const input = {id: discussionInput.id}
      const query = discussionInput.withoutSentences ?
        custom.getDiscussionSimpleWithoutAssociations :
        custom.getDiscussionSimpleWithAssociations
      const response = await API.graphql(graphqlOperation(query, input)) as {data}
      if (!response.data.getDiscussion) {
        throw new GetDiscussionError('no such discussion')
      }
      if (response.data.getDiscussion.isPrivate) {
        const userDiscussions = response.data.getDiscussion.userDiscussions.items.map(i => i.userId)
        console.log('u2', userDiscussions, state.discussions.username)
        if (!userDiscussions.includes(state.discussions.username)) {
          throw new GetDiscussionError('no access to private discussion2')
        }
      }
      return response
    }

    async function getSentence(id) {
      const response = await API.graphql(graphqlOperation(queries.getSentence, {id})) as {data}
      return response.data.getSentence
    }

    async function readLayout(section) {
      const expireIdleDrafts = hoursAgo(discussion.updatedAt) > 1
      const stateSentences = state.discussions[section]
      for (let pos = 0; pos < parsedLayout[section].length; pos++) {
        const layoutEntry = parsedLayout[section][pos]
        const sentence = stateSentences.find(s => s.id === layoutEntry.id)
          || sentences.find(s => s.id === layoutEntry.id)
          || await getSentence(layoutEntry.id)
        if (!sentence) {
          throw new GetDiscussionError('invalid sentence id, fixing layout')
        }
        const notUnique = newSentences[section].some(s => s.id === sentence.id)
        if (notUnique) {
          throw new GetDiscussionError('non-unique sentence id, fixing layout')
        }
        const newSentence = newSentenceFromLayoutEntry(sentence, layoutEntry)
        if (newSentence.status === 'draft' && expireIdleDrafts) {
          newSentence.status = 'committed'
          newSentence.owner = undefined
          layoutUpdated = true
        }
        newSentences[section].push(newSentence)
      }
    }

    // called from subscription
    const isUpdate = discussionInput['revision'] !== undefined

    const state = getState()
    if (state.discussions.discussionId && state.discussions.discussionId !== discussionInput.id) {
      throw new Error('received update from wrong discussion')
    }
    if (isUpdate && discussionInput['revision'] <= state.discussions.revision) {
      return  // already up to date
    }
    if (isUpdate && state.revision === 0) {
      return  // haven't completed initial load
    }

    const commonAttributes = ['id', 'revision', 'version', 'layout', 'updatedAt', 'inviteCode', 'isPrivate']
    if (isUpdate) {
      discussion = pick(discussionInput, commonAttributes)
    }
    else if (discussionInput.withoutSentences === true) {
      const response = await loadDiscussion()
      discussion = pick(response.data.getDiscussion, commonAttributes)
    }
    else {
      const response = await loadDiscussion()
      discussion = pick(response.data.getDiscussion, concat(commonAttributes, ['userDiscussions']))
      if (discussion.isPrivate && discussion.userDiscussions.items) {
        // @ts-ignore
        console.log('s', discussion.userDiscussions.items.map(i => i.userId))
      }
      sentences = response.data.getDiscussion.sentences.items
    }

    if (!discussion.revision || discussion.version !== 2) {
      console.error('version', discussion)
      throw new GetDiscussionError('bad version')
    }

    parsedLayout = parseDiscussionLayout(discussion.layout)
    await readLayout('propositions')
    await readLayout('arguments')
    dispatch(updateDiscussion({
      revision: discussion.revision,
      isPrivate: discussion.isPrivate,
      inviteCode: discussion.inviteCode,
      newSentences
    }))
    if (layoutUpdated) {
      await dispatch(updateDiscussionLayout('expire commits'))
    }
  }
}

function replaceSentence(input: {key: string, section: Section, content: string}) {
  const {key, section, content} = input
  const {updateSentence} = discussionsSlice.actions
  async function createNewSentence(content, discussionId) {
    const variables = {input: {content, discussionId}}
    const response = await API.graphql(graphqlOperation(mutations.createSentence, variables)) as {data}
    return response.data.createSentence.id
  }
  async function disassociateSentence(id) {
    const variables = {input: {id, discussionId: null}}
    API.graphql(graphqlOperation(mutations.updateSentence, variables))
  }
  return async (dispatch, getState) => {
    const state = getState()
    try {
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
      let newSentenceId
      if (content !== sentence.content || !sentence.id) {
        newSentenceId = await createNewSentence(content, discussionId)
        if (sentence.id) {
          disassociateSentence(sentence.id)
        }
      }
      else {
        newSentenceId = sentence.id
      }
      const index = nextUniqueIndex(sentence, sentences)
      let {status, owner} = sentence
      if (sentence.id) {
        status = 'committed'
        owner = undefined
      }
      if (isPresent(content) && !state.discussions.username) {
        throw new Error('why is this happening?')
      }
      const newSentence = {key, index, content, id: newSentenceId, status, owner}
      if (isPresent(content)) {
        const asserted = sentence.accepted.includes(state.discussions.username) ||
          sentence.rejected.includes(state.discussions.username) ||
          sentence.cleared.includes(state.discussions.username)
        const accepted = !asserted ? [state.discussions.username] : sentence.accepted
        Object.assign(newSentence, {accepted}, pick(sentence, ['rejected', 'cleared', 'goal']))
      }
      else {
        Object.assign(newSentence, {accepted: [], rejected: [], cleared: [], goal: []})
      }
      dispatch(updateSentence({section, newSentence}))
      await dispatch(updateDiscussionLayout('replace'))
      if (state.discussions.arguments.length === 0 && state.discussions.propositions.length > 0 && isPresent(content)) {
        await dispatch(addNewSentence('arguments', 'committed'))
      }
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        console.warn('try again', tryAgainTrials)
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(replaceSentenceAction({key, section, content}))
      }
      else {
        throw exception
      }
    }
  }
}

export const isActionable = {
  edit: (sentence: Sentence, username: string) => !sentence.inArgument
    && !sentenceCommittedOthers(sentence, username)
    && !(sentence.status === 'draft' && sentence.owner !== username),
  accept: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && isPresent(sentence.content),
  reject: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && isPresent(sentence.content),
  clear: (sentence: Sentence, username: string) => sentence.status === 'committed'
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
    const state = getState()
    try {
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
        newSentence = {
          ...sentence, status: 'draft', owner: username, hidden: false
        }
      }
      else if (change === 'accept' && isActionable.accept(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        const newCleared = new Set(sentence.cleared)
        newAccepted.add(username)
        newRejected.delete(username)
        newCleared.delete(username)
        newSentence = {
          ...sentence,
          accepted: Array.from(newAccepted),
          rejected: Array.from(newRejected),
          cleared: Array.from(newCleared)
        }
      }
      else if (change === 'reject' && isActionable.reject(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        const newCleared = new Set(sentence.cleared)
        newAccepted.delete(username)
        newRejected.add(username)
        newCleared.delete(username)
        newSentence = {
          ...sentence,
          accepted: Array.from(newAccepted),
          rejected: Array.from(newRejected),
          cleared: Array.from(newCleared)
        }
      }
      else if (change === 'clear' && isActionable.clear(sentence, username)) {
        const newAccepted = new Set(sentence.accepted)
        const newRejected = new Set(sentence.rejected)
        const newCleared = new Set(sentence.cleared)
        newAccepted.delete(username)
        newRejected.delete(username)
        newCleared.add(username)
        newSentence = {
          ...sentence,
          accepted: Array.from(newAccepted),
          rejected: Array.from(newRejected),
          cleared: Array.from(newCleared)
        }
      }
      else {
        console.warn('unknown action or invalid conditions:', change, sentence)
        return
      }
      dispatch(updateSentence({section, newSentence}))
      await dispatch(updateDiscussionLayout(change))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        console.warn('try again', tryAgainTrials)
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(changeSentenceStatusAction(input))
      }
      else {
        throw exception
      }
    }
  }
}

function changeGoalSentence(position: number) {
  const {setGoal} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(setGoal(position))
      await dispatch(updateDiscussionLayout('goal'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        console.warn('try again', tryAgainTrials)
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(changeGoalSentenceAction(position))
      }
      else {
        throw exception
      }
    }
  }
}

function changeSentenceHidden(args: {section: Section, position: number, hidden: boolean}) {
  const {setSentenceHidden} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(setSentenceHidden(args))
      await dispatch(updateDiscussionLayout('hidden'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        console.warn('try again', tryAgainTrials)
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(changeSentenceHiddenAction(args))
      }
      else {
        throw exception
      }
    }
  }
}

function createInviteCode() {
  const {setInviteCode} = discussionsSlice.actions
  return async (dispatch) => {
    const inviteCode = generateInviteCode()
    dispatch(setInviteCode(inviteCode))
    await dispatch(updateDiscussionLayout('create invite code'))
  }
}

function revokeInviteCode() {
  const {setInviteCode} = discussionsSlice.actions
  return async (dispatch) => {
    dispatch(setInviteCode(undefined))
    await dispatch(updateDiscussionLayout('revoke invite code'))
  }
}

const eventHandlerFunctions = {
  createNewDiscussion,
  initializeDiscussion,
  getDiscussion,
  replaceSentence,
  changeSentenceStatus,
  changeGoalSentence,
  changeSentenceHidden,
  createInviteCode,
  revokeInviteCode,
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
        dispatch(eventDequeue())
      }
      dispatch(setStatus('idle'))
    }
  }
}

export function createNewDiscussionAction(value) {
  const message = `create new discussion ${value}`
  const action = {handler: 'createNewDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function initializeDiscussionAction(value) {
  const message = `initialize discussion ${value?.discussionId}`
  const action = {handler: 'initializeDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function getDiscussionAction(value) {
  const message = `get discussion ${value?.id} ${value?.revision}`
  const action = {handler: 'getDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function replaceSentenceAction(value) {
  const message = `replace sentence ${value?.key}`
  const action = {handler: 'replaceSentence', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeSentenceStatusAction(value: ChangeSentenceStatusInput) {
  const message = `change sentence status ${value?.key}`
  const action = {handler: 'changeSentenceStatus', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeGoalSentenceAction(value) {
  const message = `change goal sentence ${value?.position}`
  const action = {handler: 'changeGoalSentence', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeSentenceHiddenAction(value) {
  const message = `change goal sentence ${value?.position} ${value?.section}`
  const action = {handler: 'changeSentenceHidden', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function createInviteCodeAction() {
  const message = `create invite code`
  const action = {handler: 'createInviteCode', message}
  return dispatch => dispatch(enqueueEvent(action))
}
export function revokeInviteCodeAction() {
  const message = `revoke invite code`
  const action = {handler: 'revokeInviteCode', message}
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
      await dispatch(addNewSentence(section, 'draft'))
    }
    dispatch(setFocus({section, position}))
  }
}

export function loadRecentDiscussions() {
  const {setRecentDiscussions} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const responsePublic = await API.graphql(graphqlOperation(custom.listRecentDiscussions, {isPrivate: false})) as {data}
    const responsePrivate = await API.graphql(graphqlOperation(custom.listRecentDiscussions, {isPrivate: true})) as {data}
    const recentDiscussions = {
      privateDiscussions: responsePrivate.data.searchDiscussions.items,
      publicDiscussions: responsePublic.data.searchDiscussions.items,
    }
    dispatch(setRecentDiscussions(recentDiscussions))
  }
}

export function acceptInviteCode(inviteCode) {
  const {setNewDiscussionId} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const inviteVariables = {inviteCode}
    const response = await API.graphql(graphqlOperation(custom.queryDiscussionsByInviteCode, inviteVariables)) as {data}
    if (response.data) {
      const state = getState()
      const discussionId = response.data.queryDiscussionsByInviteCode.items[0].id
      const userDiscussions = response.data.queryDiscussionsByInviteCode.items[0].userDiscussions.items.map(i => i.userId)
      if (!userDiscussions.includes(state.discussions.username)) {
        const userVariables = {input: {discussionId, userId: state.discussions.username}}
        await API.graphql(graphqlOperation(mutations.createUserDiscussion, userVariables))
      }
      dispatch(setNewDiscussionId(discussionId))
    }
  }
}
