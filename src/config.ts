import { readFileSync, accessSync } from 'fs'
import YAML from 'yaml'
import { Log } from './args'
import { GiferParams } from './gifer'

const yamlPaths = [
  '~/.gifizer.yaml',
  '~/.gifizer.yml',
  './.gifizer.yaml',
  './.gifizer.yml',
]

const jsonPaths = ['~/.gifizer.json', './.gifizer.json']

function pathExists(path: string): boolean {
  try {
    accessSync(path)
    return true
  } catch (error) {
    return false
  }
}

type Config = {
  presets: Record<string, GiferParams>
}

function readYamls(): Record<string, GiferParams> {
  Log.debug(`attempting to read yaml configs`)
  let yamlConfs: Record<string, GiferParams> = {}

  for (const yamlPath of yamlPaths) {
    if (!pathExists(yamlPath)) {
      continue
    }

    Log.debug(`reading config from ${yamlPath}`)

    const newConf: Config = YAML.parse(
      readFileSync(yamlPath, { encoding: 'utf-8' })
    )

    yamlConfs = { ...yamlConfs, ...newConf.presets }
  }

  return yamlConfs
}

// read json configs
function readJsons(): Record<string, GiferParams> {
  Log.debug(`attempting to read json configs`)
  let jsonConfs: Record<string, GiferParams> = {}

  for (const jsonPath of jsonPaths) {
    if (!pathExists(jsonPath)) {
      continue
    }

    Log.debug(`reading config from ${jsonPath}`)

    const newConf: Config = JSON.parse(
      readFileSync(jsonPath, { encoding: 'utf-8' })
    )

    jsonConfs = { ...jsonConfs, ...newConf.presets }
  }

  return jsonConfs
}

export function readCustomConfigs(): Record<string, GiferParams> {
  const yamlConfs = readYamls()
  const jsonConfs = readJsons()

  return { ...yamlConfs, ...jsonConfs }
}
