/**
 * CLAUDE.md stays within the cap every project shares.
 *
 * The check is `ts instructions check`, technosophia's shared script, and this
 * is a thin wrapper around it so the cap lives in one place. It runs the
 * script by path, `$TECHNOSOPHIA` or ~/src/technosophia, since a test does not
 * rely on PATH.
 */
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '..')
const technosophia =
  process.env.TECHNOSOPHIA ?? path.join(os.homedir(), 'src', 'technosophia')

describe('CLAUDE.md', () => {
  it('is within the cap, per ts instructions check', () => {
    try {
      execFileSync(path.join(technosophia, 'bin/instructions'), ['check'], {
        cwd: repoRoot,
        env: { ...process.env, TS_ROOT: repoRoot },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch (err) {
      const e = err as { stdout?: string; stderr?: string }
      throw new Error(
        `ts instructions check failed:\n${e.stderr ?? ''}${e.stdout ?? ''}`.trimEnd(),
      )
    }
  })
})
