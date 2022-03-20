import {Sentence} from './discussion.d'

export function claimsSummary(sentence: Sentence, discussants: string[]) : boolean[] {
  if (sentence.accepted.length > 0 && sentence.rejected.length > 0) {
    return [true, false]
  }
  if (sentence.accepted.length > 1) {
    return [true, true]
  }
  if (sentence.rejected.length > 1) {
    return [false, false]
  }
  if (sentence.accepted.length === 1) {
    return [true]
  }
  if (sentence.rejected.length === 1) {
    return [false]
  }
  if (sentence.accepted.length === 0 && sentence.rejected.length === 0) {
    return []
  }

  throw new Error('summary invalid')
}
