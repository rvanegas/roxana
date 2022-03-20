import dayjs from 'dayjs'
import cryptoRandomString from 'crypto-random-string'
import parse from 'url-parse'

export const dlog: any = function(...msg) {dlog.enabled && console.log(...msg)}
dlog.warn = function(...msg) {dlog.enabled && console.warn(...msg)}
dlog.error = function(...msg) {dlog.enabled && console.error(...msg)}

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
  // console.log('redirect', discussionId)
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

export function hoursAgo(ago) {
  return dayjs().diff(dayjs(ago), 'hour')
}

// function toLetters(index) {
//   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
//   if (index < 26) {
//     return letters[index];
//   }
//   const digits = index
//     .toString(26)
//     .split("")
//     .map((d) => parseInt(d, 26));
//   digits[0]--;
//   return digits.map((d) => letters[d]).join("");
// }
