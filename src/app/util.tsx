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
