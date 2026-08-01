import { generateClient } from 'aws-amplify/api'
import {pick, sortBy, reverse, concat} from 'lodash'
import * as mutations from '../../graphql/mutations'
import * as queries from '../../graphql/queries'
import * as custom from '../../graphql/custom'
import {dlog, hoursAgo, isPresent,
  generateDiscussionId, generateInviteCode} from '../../app/util'
import {Section, Sentence} from './discussion.d'
import {AuditResult, DianoiaResultData} from './dianoia.types'
import {createDiscussionLayout, createNewDiscussionLayout,
  newSentenceFromLayoutEntry, parseDiscussionLayout} from './layout'
import {discussionsSlice, nextUniqueIndex, sentenceCommittedOthers,
  propositionIndexesFromArgument, forcedPropositionPositions} from './discussionsSlice'

// generateClient's return type is a deeply recursive generic that TS cannot
// compare without exceeding its stack-depth limit; the client is used untyped
// here (raw graphql strings, results cast to any), so annotate it plainly.
let _client: any = null
const client = () => { if (!_client) _client = generateClient({ authMode: 'apiKey' }); return _client }

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
  // async function updateUserDiscussions(discussionId) {
  //   const getVariables = {discussionId}
  //   console.log('ud1', discussionId, getVariables)
  //   const response = await API.graphql(graphqlOperation(queries.queryUserDiscussionByDiscussionId, getVariables)) as {data}
  //   console.log('ud2', discussionId, response)
  //   for (let item of response.data.queryUserDiscussionByDiscussionId.items) {
  //     console.log('item', item)
  //   }
  // }
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const layout = createDiscussionLayout(pick(state.discussions, ['propositions', 'arguments', 'selectMode', 'selectedPropositions', 'selectedArguments']))
      const id = state.discussions.discussionId
      const version = 2
      const oldRevision = state.discussions.revision
      const revision = oldRevision + 1
      const goalsSummary = getGoalsSummary(state.discussions)
      // gql requires null (not undefined or empty string) to clear invite code
      const inviteCode = state.discussions.inviteCode || null
      const pool = 1
      const analysisResults = JSON.stringify(state.discussions.analysisResults ?? {})
      const analyzingState = state.discussions.analyzingState
        ? JSON.stringify(state.discussions.analyzingState)
        : null
      const auditResult = state.discussions.auditResult
        ? JSON.stringify(state.discussions.auditResult)
        : null
      const variables = {
        input: {id, version, revision, layout, goalsSummary, analysisResults, analyzingState, auditResult, inviteCode, pool},
        condition: {revision: {eq: oldRevision}}
      }
      await client().graphql({ query: mutations.updateDiscussion, variables })
      // updateUserDiscussions(id)
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
    dispatch(addSentence({section, status}))
    const position = getState().discussions[section].length - 1
    dispatch(replaceSentenceAction({section, position, content: ''}))
  }
}

function createNewDiscussion({isPrivate}) {
  const {setNewDiscussionId} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const id = ''
    const version = 2
    const revision = 1
    const layout = createNewDiscussionLayout()
    const pool = 1
    const variables = {input: {id, version, revision, isPrivate, layout, pool}}
    let discussionId
    for (;;) {
      try {
        discussionId = generateDiscussionId()
        variables.input.id = discussionId
        await client().graphql({ query: mutations.createDiscussion, variables })
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
      await client().graphql({ query: mutations.createUserDiscussion, variables: userVariables })
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
      const response = await client().graphql({ query, variables: input }) as {data: any}
      if (!response.data.getDiscussion) {
        throw new GetDiscussionError('no such discussion')
      }
      if (response.data.getDiscussion.isPrivate) {
        const usernames = usernamesFromDiscussion(response.data.getDiscussion)
        if (!usernames.includes(state.discussions.username)) {
          throw new GetDiscussionError('no access to private discussion')
        }
      }
      return response
    }

    async function getSentence(id) {
      const response = await client().graphql({ query: queries.getSentence, variables: { id } }) as {data: any}
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
    if (isUpdate) {
      if (discussionInput['revision'] <= state.discussions.revision) {
        return  // already up to date
      }
      if (state.revision === 0) {
        return  // haven't completed initial load
      }
      const laterUpdate = state.discussions.eventQueue.some(event =>
        event.handler === 'getDiscussion'
        && event.payload.revision !== undefined
        && event.payload.revision > discussionInput['revision']
      )
      if (laterUpdate) {
        return  // this one is out of date
      }
    }

    const commonAttributes = ['id', 'revision', 'version', 'layout', 'analysisResults', 'analyzingState', 'auditResult', 'updatedAt', 'inviteCode', 'isPrivate']
    if (isUpdate) {
      discussion = pick(discussionInput, commonAttributes) as any
    }
    else if (discussionInput.withoutSentences === true) {
      const response = await loadDiscussion()
      discussion = pick(response.data.getDiscussion, commonAttributes) as any
    }
    else {
      const response = await loadDiscussion()
      discussion = pick(response.data.getDiscussion, concat(commonAttributes, ['userDiscussions'])) as any
      if (discussion.isPrivate && discussion.userDiscussions.items) {
        // @ts-ignore
        console.log('s', usernamesFromDiscussion(discussion))
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
    let analysisResults: Record<number, DianoiaResultData> | undefined
    try {
      analysisResults = discussion['analysisResults']
        ? JSON.parse(discussion['analysisResults'])
        : {}
    } catch {
      analysisResults = {}
    }
    let analyzingState: {position: number, username: string} | null = null
    try {
      analyzingState = discussion['analyzingState']
        ? JSON.parse(discussion['analyzingState'])
        : null
    } catch {
      analyzingState = null
    }
    let auditResult: AuditResult | null = null
    try {
      auditResult = discussion['auditResult']
        ? JSON.parse(discussion['auditResult'])
        : null
    } catch {
      auditResult = null
    }
    dispatch(updateDiscussion({
      revision: discussion.revision,
      isPrivate: discussion.isPrivate,
      inviteCode: discussion.inviteCode,
      newSentences,
      selectMode: parsedLayout.selectMode || false,
      selectedPropositions: parsedLayout.selectedPropositions || [],
      selectedArguments: parsedLayout.selectedArguments || [],
      analysisResults,
      analyzingState,
      auditResult,
    }))
    if (isUpdate && parsedLayout.navigateTo) {
      const {setNewDiscussionId} = discussionsSlice.actions
      dispatch(setNewDiscussionId(parsedLayout.navigateTo))
    }
    if (layoutUpdated) {
      await dispatch(updateDiscussionLayout('expire commits'))
    }
  }
}

function replaceSentence(input: {position: number, section: Section, content: string}) {
  const {position, section, content} = input
  const {updateSentence} = discussionsSlice.actions
  async function createNewSentence(content, discussionId) {
    const variables = {input: {content, discussionId}}
    const response = await client().graphql({ query: mutations.createSentence, variables }) as {data: any}
    return response.data.createSentence.id
  }
  async function disassociateSentence(id) {
    const variables = {input: {id, discussionId: null}}
    client().graphql({ query: mutations.updateSentence, variables })
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
      const sentence = sentences[position]
      if (!sentence) {
        console.error('not found', position, section, discussionSentences)
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
      const newSentence = {index, content, id: newSentenceId, status, owner}
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
      dispatch(updateSentence({section, position, newSentence}))
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
        dispatch(replaceSentenceAction({position, section, content}))
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
    && isPresent(sentence.content) && sentence.accepted.includes(username),
  clear: (sentence: Sentence, username: string) => sentence.status === 'committed'
    && sentence.rejected.includes(username)
}

interface ChangeSentenceStatusInput {
  position: number
  section: Section
  change: 'edit' | 'commit' | 'accept' | 'reject' | 'clear'
}

function changeSentenceStatus(input: ChangeSentenceStatusInput) {
  const {position, section, change} = input
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
      const sentence = sentences[position]
      if (!sentence) {
        console.error('not found', position, section, discussionSentences)
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
      dispatch(updateSentence({section, position, newSentence}))
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

// Apply an improver recommendation additively: deposit `content` as a new
// committed proposition, leaving any original proposition untouched. When
// `justifiesSymbol` is present (a `new` premise), also create a fresh argument
// in which the new proposition justifies that symbol — the justified
// proposition is placed last, since the argument's conclusion is its final
// index (see propositionIndexesFromArgument / discussionsSlice).
function applyRecommendationAdd(payload: {content: string, justifiesSymbol: string | null}) {
  const {addSentence} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const {content, justifiesSymbol} = payload
    dispatch(addSentence({section: 'propositions', status: 'committed'}))
    const propPosition = getState().discussions.propositions.length - 1
    await dispatch(replaceSentence({section: 'propositions', position: propPosition, content}))
    if (justifiesSymbol) {
      const newIndex = propPosition + 1
      dispatch(addSentence({section: 'arguments', status: 'committed'}))
      const argPosition = getState().discussions.arguments.length - 1
      await dispatch(replaceSentence({
        section: 'arguments', position: argPosition,
        content: `${newIndex} ${justifiesSymbol}`,
      }))
    }
  }
}

// Apply a `rewrite` recommendation in place, replacing the target proposition's
// content via the same path the inline editor uses (replaceSentence). Gated on
// isActionable.edit — the caller grays out the action otherwise, and this is a
// defensive re-check since state may have changed between render and dispatch.
function applyRecommendationRewrite(payload: {position: number, content: string}) {
  return async (dispatch, getState) => {
    const {position, content} = payload
    const state = getState()
    const sentence = state.discussions.propositions[position]
    const username = state.discussions.username
    if (!sentence || !isActionable.edit(sentence, username)) {
      console.warn('rewrite target not editable', position)
      return
    }
    await dispatch(replaceSentence({section: 'propositions', position, content}))
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
  createDiscussionFromSelection,
  initializeDiscussion,
  getDiscussion,
  replaceSentence,
  changeSentenceStatus,
  changeGoalSentence,
  changeSentenceHidden,
  createInviteCode,
  revokeInviteCode,
  applyRecommendationAdd,
  applyRecommendationRewrite,
}

function enqueueEvent(action) {
  const {setStatus, eventEnqueue, eventDequeue} = discussionsSlice.actions
  if (!action.handler) {
    throw new Error(`unknown handler: ${action.handler}`)
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

function enterSelectMode() {
  const {enterSelectMode: enterSelectModeLocal} = discussionsSlice.actions
  return async (dispatch) => {
    dispatch(enterSelectModeLocal())
    await dispatch(updateDiscussionLayout('enter select mode'))
  }
}

function exitSelectMode() {
  const {exitSelectMode: exitSelectModeLocal} = discussionsSlice.actions
  return async (dispatch) => {
    dispatch(exitSelectModeLocal())
    await dispatch(updateDiscussionLayout('exit select mode'))
  }
}

function toggleSelectProposition(position: number) {
  const {toggleSelectProposition: toggleLocal} = discussionsSlice.actions
  return async (dispatch) => {
    dispatch(toggleLocal(position))
    await dispatch(updateDiscussionLayout('toggle select proposition'))
  }
}

function toggleSelectArgument(position: number) {
  const {toggleSelectArgument: toggleLocal} = discussionsSlice.actions
  return async (dispatch) => {
    dispatch(toggleLocal(position))
    await dispatch(updateDiscussionLayout('toggle select argument'))
  }
}

function broadcastNavigation(newDiscussionId: string) {
  const {incrementRevision} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    const layout = createDiscussionLayout({
      ...pick(state.discussions, ['propositions', 'arguments', 'selectMode', 'selectedPropositions', 'selectedArguments']),
      navigateTo: newDiscussionId,
    })
    const id = state.discussions.discussionId
    const oldRevision = state.discussions.revision
    const revision = oldRevision + 1
    const inviteCode = state.discussions.inviteCode || null
    const variables = {
      input: {id, version: 2, revision, layout, goalsSummary: '', inviteCode, pool: 1},
      condition: {revision: {eq: oldRevision}}
    }
    await client().graphql({ query: mutations.updateDiscussion, variables })
    dispatch(incrementRevision(revision))
  }
}

async function generateAvailableDiscussionId() {
  // Sentences reference the discussion id before the Discussion row exists, so a
  // collision cannot be retried after the fact — verify availability upfront.
  for (let attempt = 0; attempt < 8; attempt++) {
    const id = generateDiscussionId()
    const response = await client().graphql({
      query: queries.getDiscussion, variables: { id }
    }) as {data: any}
    if (!response.data.getDiscussion) return id
  }
  throw new Error('could not find an available discussion id')
}

function createDiscussionFromSelection() {
  const {setNewDiscussionId} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState().discussions
    const forced = forcedPropositionPositions(state)
    const allPropPositions = Array.from(
      new Set([...state.selectedPropositions, ...forced])
    ).sort((a, b) => a - b)

    const propNumberMap = new Map<number, number>()
    allPropPositions.forEach((pos, i) => propNumberMap.set(pos + 1, i + 1))

    const discussionId = await generateAvailableDiscussionId()

    const propEntries: object[] = []
    for (let i = 0; i < allPropPositions.length; i++) {
      const sentence = state.propositions[allPropPositions[i]]
      const response = await client().graphql({
        query: mutations.createSentence,
        variables: { input: { content: sentence.content, discussionId } }
      }) as {data: any}
      propEntries.push(pick({
        ...sentence, id: response.data.createSentence.id, index: i + 1
      }, ['id', 'index', 'status', 'owner', 'accepted', 'rejected', 'cleared', 'goal', 'hidden']))
    }

    const remapSymbol = (sym: string) => String(propNumberMap.get(Number(sym)) ?? sym)
    const remapMaybe = (sym: string | null) => sym == null ? sym : remapSymbol(sym)
    const remapAnalysis = (data: DianoiaResultData): DianoiaResultData => ({
      ...data,
      truthEvaluations: data.truthEvaluations.map(ev => ({...ev, symbol: remapSymbol(ev.symbol)})),
      validityEvaluations: data.validityEvaluations.map(ev => ({...ev, symbol: remapSymbol(ev.symbol)})),
      formalizations: data.formalizations.map(f => ({...f, symbol: remapSymbol(f.symbol)})),
      propositionEvaluations: data.propositionEvaluations.map(ev => ({...ev, symbol: remapSymbol(ev.symbol)})),
      incoherentSets: data.incoherentSets.map(s => ({...s, symbols: s.symbols.map(remapSymbol)})),
      phrasingEvaluations: (data.phrasingEvaluations ?? []).map(ev => ({...ev, symbol: remapSymbol(ev.symbol)})),
      improverRecommendations: (data.improverRecommendations ?? []).map(rec => ({
        ...rec,
        target_proposition: remapSymbol(rec.target_proposition),
        propositions: rec.propositions.map(p => ({
          ...p,
          original_symbol: remapMaybe(p.original_symbol),
          justifies_symbol: remapMaybe(p.justifies_symbol),
        })),
      })),
    })

    const sortedArgPositions = [...state.selectedArguments].sort((a, b) => a - b)
    const argEntries: object[] = []
    const newAnalysisResults: Record<number, DianoiaResultData> = {}
    for (let i = 0; i < sortedArgPositions.length; i++) {
      const oldPos = sortedArgPositions[i]
      const sentence = state.arguments[oldPos]
      const newContent = propositionIndexesFromArgument(sentence)
        .map(n => propNumberMap.get(n)).join(' ')
      const response = await client().graphql({
        query: mutations.createSentence,
        variables: { input: { content: newContent, discussionId } }
      }) as {data: any}
      argEntries.push(pick({
        ...sentence, id: response.data.createSentence.id, index: i + 1, content: newContent
      }, ['id', 'index', 'status', 'owner', 'accepted', 'rejected', 'cleared', 'goal', 'hidden']))
      if (state.analysisResults[oldPos]) {
        newAnalysisResults[i] = remapAnalysis(state.analysisResults[oldPos])
      }
    }

    const layout = JSON.stringify({ propositions: propEntries, arguments: argEntries })
    await client().graphql({ query: mutations.createDiscussion, variables: { input: { id: discussionId, version: 2, revision: 1, isPrivate: false, layout, pool: 1 } } })
    if (Object.keys(newAnalysisResults).length > 0) {
      const analysisResults = JSON.stringify(newAnalysisResults)
      await client().graphql({ query: mutations.updateDiscussion, variables: { input: { id: discussionId, analysisResults } } })
    }
    await dispatch(broadcastNavigation(discussionId))
    await dispatch(exitSelectMode())
    dispatch(setNewDiscussionId(discussionId))
  }
}

export function enterSelectModeAction() {
  return dispatch => dispatch(enterSelectMode())
}
export function exitSelectModeAction() {
  return dispatch => dispatch(exitSelectMode())
}
export function toggleSelectPropositionAction(position: number) {
  return dispatch => dispatch(toggleSelectProposition(position))
}
export function toggleSelectArgumentAction(position: number) {
  return dispatch => dispatch(toggleSelectArgument(position))
}
export function createNewDiscussionAction(value) {
  const message = `create new discussion ${value} t=${tryAgainTrials}`
  const action = {handler: 'createNewDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function createDiscussionFromSelectionAction() {
  const message = `create discussion from selection t=${tryAgainTrials}`
  const action = {handler: 'createDiscussionFromSelection', message}
  return dispatch => dispatch(enqueueEvent(action))
}
export function initializeDiscussionAction(value) {
  const message = `initialize discussion ${value?.discussionId} t=${tryAgainTrials}`
  const action = {handler: 'initializeDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function getDiscussionAction(value) {
  const message = `get discussion ${value?.id} ${value?.revision} t=${tryAgainTrials}`
  const action = {handler: 'getDiscussion', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function replaceSentenceAction(value) {
  const message = `replace sentence ${value?.position} t=${tryAgainTrials}`
  const action = {handler: 'replaceSentence', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeSentenceStatusAction(value: ChangeSentenceStatusInput) {
  const message = `change sentence status ${value?.position} t=${tryAgainTrials}`
  const action = {handler: 'changeSentenceStatus', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function applyRecommendationAddAction(value: {content: string, justifiesSymbol: string | null}) {
  const message = `apply recommendation add t=${tryAgainTrials}`
  const action = {handler: 'applyRecommendationAdd', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function applyRecommendationRewriteAction(value: {position: number, content: string}) {
  const message = `apply recommendation rewrite ${value?.position} t=${tryAgainTrials}`
  const action = {handler: 'applyRecommendationRewrite', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeGoalSentenceAction(value) {
  const message = `change goal sentence ${value?.position} t=${tryAgainTrials}`
  const action = {handler: 'changeGoalSentence', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function changeSentenceHiddenAction(value) {
  const message = `change goal sentence ${value?.position} ${value?.section} t=${tryAgainTrials}`
  const action = {handler: 'changeSentenceHidden', message, payload: value}
  return dispatch => dispatch(enqueueEvent(action))
}
export function createInviteCodeAction() {
  const message = `create invite code t=${tryAgainTrials}`
  const action = {handler: 'createInviteCode', message}
  return dispatch => dispatch(enqueueEvent(action))
}
export function revokeInviteCodeAction() {
  const message = `revoke invite code t=${tryAgainTrials}`
  const action = {handler: 'revokeInviteCode', message}
  return dispatch => dispatch(enqueueEvent(action))
}

function saveArgumentAnalysisResults(position: number, data: DianoiaResultData) {
  const {setArgumentAnalysisResults, setAnalyzingState} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(setArgumentAnalysisResults({position, data}))
      dispatch(setAnalyzingState(null))
      await dispatch(updateDiscussionLayout('save analysis results'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(saveArgumentAnalysisResultsAction(position, data))
      } else {
        throw exception
      }
    }
  }
}

function deleteArgumentAnalysisResults(position: number) {
  const {clearArgumentAnalysisResults} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(clearArgumentAnalysisResults(position))
      await dispatch(updateDiscussionLayout('clear analysis results'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(deleteArgumentAnalysisResultsAction(position))
      } else {
        throw exception
      }
    }
  }
}

export function saveArgumentAnalysisResultsAction(position: number, data: DianoiaResultData) {
  return (dispatch) => dispatch(saveArgumentAnalysisResults(position, data))
}

function saveAuditResult(result: AuditResult) {
  const {setAuditResult} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(setAuditResult(result))
      await dispatch(updateDiscussionLayout('save audit result'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(saveAuditResultAction(result))
      } else {
        throw exception
      }
    }
  }
}

export function saveAuditResultAction(result: AuditResult) {
  return (dispatch) => dispatch(saveAuditResult(result))
}

export function deleteArgumentAnalysisResultsAction(position: number) {
  return (dispatch) => dispatch(deleteArgumentAnalysisResults(position))
}

function setAnalyzingStateThunk(value: {position: number, username: string} | null) {
  const {setAnalyzingState} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const state = getState()
    try {
      dispatch(setAnalyzingState(value))
      await dispatch(updateDiscussionLayout(value ? 'set analyzing state' : 'clear analyzing state'))
      tryAgainTrials = 0
    }
    catch (exception: any) {
      if (exception.name === 'UnexpectedLayoutRevision' && tryAgainTrials < tryAgainTrialsMax) {
        tryAgainTrials++
        dispatch(getDiscussionAction({id: state.discussions.discussionId, withoutSentences: true}))
        dispatch(setAnalyzingStateAction(value))
      } else {
        throw exception
      }
    }
  }
}

export function setAnalyzingStateAction(value: {position: number, username: string} | null) {
  return (dispatch) => dispatch(setAnalyzingStateThunk(value))
}

export function usernamesFromDiscussion(discussion) {
  return discussion.userDiscussions.items.map(i => i.userId)
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
    const state = getState()
    const userId = state.discussions.username
    const responsePublic = await client().graphql({ query: custom.queryDiscussionsByPool }) as {data: any}
    const publicDiscussions = responsePublic.data.queryDiscussionsByPool.items
    let privateDiscussions = []
    if (userId) {
      const responsePrivate = await client().graphql({ query: custom.queryUserDiscussionsByUserId, variables: { userId } }) as {data: any}
      privateDiscussions = responsePrivate.data.queryUserDiscussionsByUserId.items
    }
    dispatch(setRecentDiscussions({publicDiscussions, privateDiscussions}))
  }
}

export function acceptInviteCode(inviteCode) {
  const {setNewDiscussionId} = discussionsSlice.actions
  return async (dispatch, getState) => {
    const inviteVariables = {inviteCode}
    const response = await client().graphql({ query: custom.queryDiscussionsByInviteCode, variables: inviteVariables }) as {data: any}
    if (response.data) {
      const state = getState()
      const discussionId = response.data.queryDiscussionsByInviteCode.items[0].id
      const usernames = usernamesFromDiscussion(response.data.queryDiscussionsByInviteCode.items[0])
      if (!usernames.includes(state.discussions.username)) {
        const userVariables = {input: {discussionId, userId: state.discussions.username}}
        await client().graphql({ query: mutations.createUserDiscussion, variables: userVariables })
      }
      dispatch(setNewDiscussionId(discussionId))
    }
  }
}
