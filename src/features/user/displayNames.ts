// What people are shown as: the display name each keeps at auth
// (auth.rvanegas.co, since 2026-11-09), the one The Floor shows too.
//
// A discussion's lists (accepted, rejected, cleared, goal) and its
// discussants keep user names, which identify people and are what the
// signed-in username is matched against; only what is shown changes. The
// names are asked of auth with the signed-in person's token, at most once per
// user name per page load, and a user name auth has no display name for, or
// that nobody signed in could ask about, is shown as itself.

import {useEffect, useState} from 'react'
import {getAccessToken} from './auth'

const AUTH_URL = (import.meta.env.VITE_AUTH_URL ?? 'https://auth.rvanegas.co').replace(/\/$/, '')
// auth's limit on one lookup.
const BATCH = 200

const known = new Map<string, string | null>()
const asked = new Set<string>()
const listeners = new Set<() => void>()

// The display name for a user name, or the user name until one is known.
export function displayName(username: string): string {
  return known.get(username) || username
}

// What auth said of the signed-in person, so they need not be asked about.
export function rememberDisplayName(username: string, name: string | null) {
  known.set(username, name)
  asked.add(username)
  listeners.forEach(listener => listener())
}

// Asks auth for the display names of user names not asked about yet.
export async function lookUpDisplayNames(usernames: string[]): Promise<void> {
  const wanted = [...new Set(usernames)].filter(u => u && !asked.has(u))
  if (wanted.length === 0) return
  const token = await getAccessToken()
  if (!token) return
  wanted.forEach(u => asked.add(u))
  for (let i = 0; i < wanted.length; i += BATCH) {
    const query = new URLSearchParams(wanted.slice(i, i + BATCH).map(u => ['user', u]))
    try {
      const response = await fetch(`${AUTH_URL}/names/display?${query}`, {headers: {Authorization: `Bearer ${token}`}})
      if (!response.ok) continue
      const {names} = await response.json() as {names: Record<string, string | null>}
      // auth answers by user name as it keeps them, lowercase.
      for (const u of wanted.slice(i, i + BATCH)) known.set(u, names[u.toLowerCase()] ?? null)
    } catch {}
  }
  listeners.forEach(listener => listener())
}

// `displayName`, re-rendering once the names of these people have arrived.
export function useDisplayNames(usernames: string[]): (username: string) => string {
  const [, setVersion] = useState(0)
  const key = [...new Set(usernames)].sort().join('\n')
  useEffect(() => {
    const listener = () => setVersion(v => v + 1)
    listeners.add(listener)
    lookUpDisplayNames(key ? key.split('\n') : [])
    return () => { listeners.delete(listener) }
  }, [key])
  return displayName
}
