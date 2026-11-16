/**
 * How an argument is typed and shown (src/features/discussion/argumentInput.ts):
 * any separator reads as whitespace, the content keeps the bare indexes, and
 * the field shows the justifiers, an arrow and the conclusion.
 */
import { describe, expect, it } from 'vitest'
import { argumentContent, argumentDisplay, parseArgumentInput } from '../src/features/discussion/argumentInput'

describe('argument input', () => {
  it('reads any run of punctuation or whitespace as a separator', () => {
    expect(parseArgumentInput('1, 2, 3 -> 4')).toEqual([1, 2, 3, 4])
    expect(parseArgumentInput('1 2 3 4')).toEqual([1, 2, 3, 4])
    expect(parseArgumentInput(' 1;2 → 12. ')).toEqual([1, 2, 12])
    expect(parseArgumentInput('')).toEqual([])
  })

  it('refuses letters', () => {
    expect(parseArgumentInput('1, a -> 3')).toBeNull()
    expect(parseArgumentInput('1 2b')).toBeNull()
  })

  it('stores the bare indexes and shows the arrow form', () => {
    expect(argumentContent([1, 2, 3, 4])).toBe('1 2 3 4')
    expect(argumentDisplay([1, 2, 3, 4])).toBe('1, 2, 3 -> 4')
    expect(argumentDisplay([1, 4])).toBe('1 -> 4')
    expect(argumentDisplay([4])).toBe('4')
    expect(argumentDisplay([])).toBe('')
  })
})
