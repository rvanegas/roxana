import {Sentence} from './discussion.d'

export function assertionSummary(sentence: Sentence, discussants: string[]) : boolean[] {
  let acceptions = 0
  let rejections = 0

  for (let discussant of discussants) {
    if (sentence.accepted.includes(discussant)) {
      acceptions++
    }
    if (sentence.rejected.includes(discussant)) {
      rejections++
    }
  }

  if (acceptions > 0 && rejections > 0) {
    return [true, false]
  }

  if (acceptions > 1) {
    return [true, true]
  }

  if (rejections > 1) {
    return [false, false]
  }

  if (acceptions === 1) {
    return [true]
  }

  if (rejections === 1) {
    return [false]
  }

  if (acceptions === 0 && rejections === 0) {
    return []
  }

  throw new Error('summary invalid')
}
