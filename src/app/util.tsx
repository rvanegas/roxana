import cryptoRandomString from 'crypto-random-string'
import parse from 'url-parse'

export async function sleep(ms) {
  console.log('sleep', ms)
  await new Promise(res => setTimeout(res, ms))
}

var discussionIdLength = 3
export function incrementDiscussionIdLength() {
  discussionIdLength++
}
export function generateDiscussionId() {
  return cryptoRandomString({length: discussionIdLength, type: 'distinguishable'}).toLowerCase();
}

export function discussionIdFromUrl() {
  return parse(window.location.href, true).query.d
}

export function redirectToDiscussionId(discussionId) {
  window.location.search = `?d=${discussionId}`
}

export function pick(object: object, keys: string[]) {
  const newObject = {}
  for (let key of keys) {
    newObject[key] = object[key]
  }
  return newObject
}

export function toAlphaIndex(numberIndex) {
  numberIndex--
  const base = 'A'.charCodeAt(0)
  const divisor = 'Z'.charCodeAt(0) - base + 1
  let alphas: string[] = []
  while (numberIndex >= 0) {
    const remainder = numberIndex % divisor
    alphas.unshift(String.fromCharCode(remainder + base))
    numberIndex = (numberIndex - remainder) / divisor - 1
  }
  return alphas.join('')
}
