// Sign-in through auth (auth.rvanegas.co), the one sign-in for The Floor,
// noesis, dianoia and Roxana, which replaced noesis's own OAuth server
// (2026-11-08) as that had replaced Roxana's Cognito pool. Roxana is a public
// client of auth (PKCE, no secret) with the `identity` scope alone: its tokens
// answer auth's /me, which says who signed in, and dianoia, which checks them
// by auth's keys, and reach nothing else.
//
// The refresh token (90 days, rotated on every use) is kept in localStorage,
// the access token (a quarter hour) in memory. The PKCE verifier and the path
// to return to wait in sessionStorage across the redirect to auth and back.
// The storage keys keep noesis's name: auth carried noesis's refresh tokens
// over, so nobody signed in had to sign in again.

const AUTH_URL = (import.meta.env.VITE_AUTH_URL ?? 'https://auth.rvanegas.co').replace(/\/$/, '')
const CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID ?? 'roxana'
const REFRESH_KEY = 'roxana.noesis.refresh'
const PENDING_KEY = 'roxana.noesis.pending'

export type AuthUser = {username: string, email: string | null}

let access: {token: string, expiresAt: number} | null = null
let refreshing: Promise<string | null> | null = null
let completing: {code: string, promise: Promise<string>} | null = null

function redirectUri() {
  return `${window.location.origin}/signin`
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomString() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)))
}

function storedRefresh(): string | null {
  try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
}

function storeRefresh(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token)
    else localStorage.removeItem(REFRESH_KEY)
  } catch {}
}

async function postToken(params: Record<string, string>): Promise<Response> {
  return fetch(`${AUTH_URL}/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({client_id: CLIENT_ID, ...params}),
  })
}

async function keepTokens(response: Response): Promise<string> {
  const tokens = await response.json()
  access = {token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000}
  storeRefresh(tokens.refresh_token)
  return tokens.access_token
}

// Off to auth's sign-in; it comes back to /signin, completeSignIn's.
export async function signIn(returnPath: string) {
  const verifier = randomString()
  const state = randomString()
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({verifier, state, returnPath}))
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(),
    code_challenge: base64url(new Uint8Array(digest)),
    code_challenge_method: 'S256',
    state,
  })
  window.location.assign(`${AUTH_URL}/authorize?${query}`)
}

// auth's answer at /signin: the code exchanged for tokens. Returns the path
// the person signed in from. Once per code, so StrictMode's second effect
// waits on the first.
export function completeSignIn(search: string): Promise<string> {
  const params = new URLSearchParams(search)
  const code = params.get('code') ?? ''
  if (completing?.code !== code) {
    completing = {code, promise: exchange(params)}
  }
  return completing.promise
}

async function exchange(params: URLSearchParams): Promise<string> {
  const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null')
  sessionStorage.removeItem(PENDING_KEY)
  const returnPath = pending?.returnPath ?? '/'
  if (params.get('error')) return returnPath  // declined at auth
  if (!pending || params.get('state') !== pending.state || !params.get('code')) {
    throw new Error('this sign-in is not the one Roxana started')
  }
  const response = await postToken({
    grant_type: 'authorization_code',
    code: params.get('code')!,
    redirect_uri: redirectUri(),
    code_verifier: pending.verifier,
  })
  if (!response.ok) throw new Error(`sign-in failed: ${response.status}`)
  await keepTokens(response)
  return returnPath
}

// An access token for auth's /me and dianoia, refreshed when it is about to
// expire; null when nobody is signed in or the grant is gone.
export async function getAccessToken(): Promise<string | null> {
  if (access && access.expiresAt - 60_000 > Date.now()) return access.token
  if (!refreshing) {
    refreshing = refresh().finally(() => { refreshing = null })
  }
  return refreshing
}

async function refresh(): Promise<string | null> {
  const token = storedRefresh()
  if (!token) return null
  const response = await postToken({grant_type: 'refresh_token', refresh_token: token})
  if (response.ok) return keepTokens(response)
  // Another tab may have rotated it first: try the one it stored.
  const rotated = storedRefresh()
  if (rotated && rotated !== token) return refresh()
  if (response.status === 400 || response.status === 401) storeRefresh(null)
  access = null
  return null
}

export async function currentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken()
  if (!token) return null
  const response = await fetch(`${AUTH_URL}/me`, {headers: {Authorization: `Bearer ${token}`}})
  if (!response.ok) return null
  const me = await response.json()
  return {username: me.user, email: me.email}
}

export async function signOut() {
  const token = storedRefresh()
  access = null
  storeRefresh(null)
  if (token) {
    // Revoking the refresh token ends its access tokens too.
    await fetch(`${AUTH_URL}/revoke`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({client_id: CLIENT_ID, client_secret: '', token}),
    }).catch(() => {})
  }
}
