/**
 * What people are shown as (src/features/user/displayNames.ts): the display
 * name auth keeps, asked once per user name with the signed-in person's
 * token, and the user name itself where there is none or nobody could ask.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/features/user/auth', () => ({ getAccessToken: vi.fn(async () => 'access') }))

let asked: string[]

beforeEach(() => {
  vi.resetModules()
  asked = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: { headers: Record<string, string> }) => {
    expect(init.headers.Authorization).toBe('Bearer access')
    const users = new URL(url).searchParams.getAll('user')
    asked.push(...users)
    const kept: Record<string, string | null> = { ann1: 'Ann Example', bob1: null }
    return new Response(JSON.stringify({ names: Object.fromEntries(users.map(u => [u.toLowerCase(), kept[u.toLowerCase()] ?? null])) }))
  }))
})

afterEach(() => vi.unstubAllGlobals())

describe('display names', () => {
  it('shows the name auth keeps, else the user name, asking once each', async () => {
    const names = await import('../src/features/user/displayNames')
    expect(names.displayName('ann1')).toBe('ann1')
    await names.lookUpDisplayNames(['ann1', 'bob1', 'ann1'])
    expect(names.displayName('ann1')).toBe('Ann Example')
    expect(names.displayName('bob1')).toBe('bob1')
    await names.lookUpDisplayNames(['ann1', 'bob1'])
    expect(asked).toEqual(['ann1', 'bob1'])
  })

  it('takes the signed-in person from what /me said, without asking', async () => {
    const names = await import('../src/features/user/displayNames')
    names.rememberDisplayName('cy11', 'Cy')
    await names.lookUpDisplayNames(['cy11'])
    expect(names.displayName('cy11')).toBe('Cy')
    expect(asked).toEqual([])
  })

  it('asks nothing when nobody is signed in', async () => {
    const auth = await import('../src/features/user/auth')
    vi.mocked(auth.getAccessToken).mockResolvedValueOnce(null)
    const names = await import('../src/features/user/displayNames')
    await names.lookUpDisplayNames(['ann1'])
    expect(names.displayName('ann1')).toBe('ann1')
    expect(asked).toEqual([])
  })
})
