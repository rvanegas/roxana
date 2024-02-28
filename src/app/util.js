
import cryptoRandomString from 'crypto-random-string'

export async function sleep(ms) {
  console.log('sleep', ms)
  await new Promise(res => setTimeout(res, ms))
}

export function generateShortId() {
  return cryptoRandomString({length: 6, type: 'distinguishable'}).toLowerCase();
}
