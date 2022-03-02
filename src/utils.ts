import { accessSync } from 'fs'

export function dump(msg: string, o: any, level = 1): string {
  return Object.keys(o).reduce((p, c) => {
    const tabs = new Array(level)
      .fill(' ')
      .map(() => '  ')
      .join('')

    if (typeof o[c] === 'object' && !Array.isArray(o[c])) {
      return p.concat(dump(`\n${tabs}${c}:`, o[c], level + 1))
    }

    return p.concat(`\n${tabs}${c}: ${o[c]}`)
  }, `${msg}`)
}

export function pathExists(path: string): boolean {
  try {
    accessSync(path)
    return true
  } catch (error) {
    return false
  }
}
