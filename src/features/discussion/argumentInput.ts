/**
 * How an argument is typed and shown. An argument's content is stored as its
 * proposition indexes separated by single spaces, justifiers first and the
 * conclusion last (`1 2 3 4`); its input field shows it as `1, 2, 3 -> 4`.
 */

// The indexes typed, or null if the input holds anything but indexes and
// separators. Any run of characters that are neither letters nor digits
// separates, so `1, 2, 3 -> 4`, `1 2 3 4` and `1;2 => 4` all read alike.
export function parseArgumentInput(input: string): number[] | null {
  const words = input.split(/[^\p{L}\p{N}]+/u).filter(word => word !== '')
  if (words.some(word => !/^\d+$/.test(word))) {
    return null
  }
  return words.map(word => parseInt(word))
}

export function argumentContent(indexes: number[]): string {
  return indexes.join(' ')
}

export function argumentDisplay(indexes: number[]): string {
  if (indexes.length < 2) {
    return indexes.join('')
  }
  return `${indexes.slice(0, -1).join(', ')} -> ${indexes[indexes.length - 1]}`
}
