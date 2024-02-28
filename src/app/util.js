import cryptoRandomString from 'crypto-random-string'
import parse from 'url-parse'

export async function sleep(ms) {
  console.log('sleep', ms)
  await new Promise(res => setTimeout(res, ms))
}

export function generateShortId() {
  return cryptoRandomString({length: 6, type: 'distinguishable'}).toLowerCase();
}

export function discussionIdFromQuery() {
  return parse(window.location.href, true).query.d
}

export function redirectToDiscussionIdQuery(discussionId) {
  window.location.search = `?d=${discussionId}`
}
