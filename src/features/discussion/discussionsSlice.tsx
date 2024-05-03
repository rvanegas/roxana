import {createSlice} from '@reduxjs/toolkit'
import {pull, uniq} from 'lodash'
import Cookies from 'universal-cookie'
import {dlog} from '../../app/util'
import {Section, Sentence, SentenceStatus} from './discussion.d'

const cookies = new Cookies()

interface Event {
  handler: string
  payload: any
}

interface State {
  eventQueue: Event[]
  recentDiscussions: {
    id: string,
    updatedAt: string,
    isPrivate: boolean,
    goalsSummary: string,
  }[]
  status: string
  error?: string
  discussionId?: string
  username?: string
  revision?: number
  isPrivate?: boolean
  // of Discussion
  inviteCode?: string
  // received, to verify and navigate (forced by odd dependency array behavior)
  newInviteCode?: string
  propositions: Sentence[]
  arguments: Sentence[]
  discussants: string[]
  hideDiscussants: object
  showHidden: boolean
  sentenceModal?: {
    section: Section,
    position: number
  }
  offsetHeight?: number
  newDiscussionId?: string
  argumentView?: {
    primaryPropositionPosition: number,
    secondaryPropositionPositions: number[],
    argumentPositions: number[],
  }
  // users: string[]
}

function hideDiscussantsCookie() {
  try {
    const value = cookies.get('hideDiscussants')
    return typeof value === 'object' ? value : {}
  }
  catch (exception: any) {
    return {}
  }
}

const initialState: State = {
  eventQueue: [] as Event[],
  recentDiscussions: [],
  status: 'init',
  error: undefined,
  discussionId: undefined,
  username: undefined,
  revision: undefined,
  isPrivate: undefined,
  inviteCode: undefined,
  newInviteCode: undefined,
  propositions: [],
  arguments: [],
  discussants: [],
  hideDiscussants: hideDiscussantsCookie(),
  showHidden: false,
  sentenceModal: undefined,
  offsetHeight: undefined,
  newDiscussionId: undefined,
  argumentView: undefined,
  // users: [],
}

function updateSentenceDerivatives(state) {
  const discussants = new Set<string>()
  const sentences = state.propositions.concat(state.arguments)
  for (let sentence of sentences) {
    const claimants = sentence.accepted.concat(sentence.rejected).concat(sentence.goal)
    for (let claimant of claimants) {
      discussants.add(claimant)
    }
  }
  state.discussants = Array.from(discussants).sort((a, b) => a.localeCompare(b))
  for (let discussant of state.discussants) {
    if (state.hideDiscussants[discussant] === undefined) {
      state.hideDiscussants[discussant] = false
    }
  }

  const indexes = new Set<number>()
  for (let argument of state.arguments) {
    for (let index of propositionIndexesFromArgument(argument)) {
      indexes.add(index)
    }
  }
  for (let index = 1; index <= state.propositions.length; index++) {
    state.propositions[index-1].inArgument = indexes.has(index)
  }

  for (let proposition of state.propositions) {
    proposition.irrational = []
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
          && !conclusion.accepted.includes(discussant)
          && argument.accepted.includes(discussant)
        if (irrational) {
          argument.irrational.push(discussant)
          if (!conclusion.irrational.includes(discussant)) {
            conclusion.irrational.push(discussant)
          }
          for (let premise of premises) {
            if (!premise.irrational.includes(discussant)) {
              premise.irrational.push(discussant)
            }
          }
        }
      }
    }
  }
}

export const discussionsSlice = createSlice({
  name: 'discussions',
  initialState: initialState,
  reducers: {
    setRecentDiscussions(state, action) {
      state.recentDiscussions = action.payload
    },
    initialize(state, action) {
      const discussionId: string = action.payload
      Object.assign(state, {
        discussionId,
        revision: 0,
        propositions: [],
        arguments: [],
        discussants: [],
        isPrivate: false,
        inviteCode: undefined,
        newInviteCode: undefined,
        argumentView: undefined,
      })
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
      const {section, key, status}: {section: Section, key: string, status: SentenceStatus} = action.payload
      const sentence: Sentence = {
        key, content: '', index: nextIndex(state[section]),
        status, owner: status === 'draft' ? state.username : undefined,
        accepted: [], rejected: [], cleared: [],
        irrational: [], goal: [],
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
    setGoal(state, action) {
      const position: number = action.payload
      if (!state.username) {
        return
      }
      for (let pos = 0; pos < state.propositions.length; pos++) {
        const newGoal = new Set<string>(state.propositions[pos].goal)
        if (pos === position && !newGoal.has(state.username)) {
          newGoal.add(state.username)
          state.propositions[pos].goal = Array.from(newGoal)
        }
        else if (newGoal.has(state.username)) {
          newGoal.delete(state.username)
          state.propositions[pos].goal = Array.from(newGoal)
        }
      }
    },
    setStatus(state, action) {
      state.status = action.payload
    },
    setInviteCode(state, action) {
      state.inviteCode = action.payload
    },
    setNewInviteCode(state, action) {
      state.newInviteCode = action.payload
    },
    toggleHideDiscussant(state, action) {
      const discussant: string = action.payload
      state.hideDiscussants[discussant] = !state.hideDiscussants[discussant]
      cookies.set('hideDiscussants', state.hideDiscussants)
    },
    toggleShowHidden(state) {
      state.showHidden = !state.showHidden
    },
    setSentenceModal(state, action) {
      const {section, position}: {section: Section, position: number} = action.payload
      state.sentenceModal = {section, position}
    },
    clearSentenceModal(state) {
      state.sentenceModal = undefined
    },
    setArgumentView(state, action) {
      const primaryPropositionPosition: number = action.payload
      const argumentPositions: number[] = []
      const propositionPositions = state.arguments.map((argument, argumentPosition) => {
        const positions = propositionIndexesFromArgument(argument).map(i => i - 1)
        if (positions.includes(primaryPropositionPosition)) {
          argumentPositions.push(argumentPosition)
          return positions
        }
        return []
      })
      const secondaryPropositionPositions =
        pull(uniq(propositionPositions.flat()), primaryPropositionPosition) // difference ?
      state.argumentView = {
        primaryPropositionPosition,
        secondaryPropositionPositions,
        argumentPositions,
      }
    },
    clearArgumentView(state) {
      state.argumentView = undefined
    },
    setSentenceHidden(state, action) {
      const {section, position, hidden}:
        {section: Section, position: number, hidden: boolean} = action.payload
      state[section][position].hidden = hidden
    },
    setUsername(state, action) {
      const username: string = action.payload
      state.username = username
    },
    setNewDiscussionId(state, action) {
      const newDiscussionId: string = action.payload
      state.newDiscussionId = newDiscussionId
    },
    eventEnqueue(state, action) {
      const event: Event = action.payload
      state.eventQueue.push(event)
    },
    eventDequeue(state) {
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
    updateDiscussion(state, action) {
      function mergeInNewSentences(section: Section) {
        const unsavedSentences = state[section].filter(s => !s.id)
        const base = nextIndex(newSentences[section])
        const reindexedUnsavedSentences = unsavedSentences.map((sentence, i) => {
          sentence.index = base + i;
          return sentence
        })
        state[section] = newSentences[section].concat(reindexedUnsavedSentences)
      }
      const {revision, inviteCode, isPrivate, newSentences}:
        {revision: number, inviteCode: string, isPrivate: boolean, newSentences: Sentence[]} =
        action.payload
      state.revision = revision
      state.isPrivate = isPrivate
      state.inviteCode = inviteCode
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
export function nextUniqueIndex(sentence: Sentence, sentences: Sentence[]): number {
  const indexUnique = sentences.filter(p => p.index === sentence.index).length === 1
  return indexUnique ? sentence.index : nextIndex(sentences)
}

export function sentenceCommittedOthers(sentence: Sentence, username: string): boolean {
  return sentence.accepted.concat(sentence.rejected).findIndex(n => n !== username) !== -1
}

export function propositionIndexesFromArgument(argument) {
  return argument.content ? argument.content.split(' ').map(i => parseInt(i)) : []
}

export const selectDiscussions = state => state.discussions
