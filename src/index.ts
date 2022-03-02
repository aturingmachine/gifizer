#!/usr/bin/env node

import { Args, Log } from './args'
import * as Gifer from './gifer'
import { HelpMessage } from './help-log'

async function run(): Promise<void> {
  const GiferArgs = new Args(process.argv)

  if (GiferArgs.help) {
    console.log(HelpMessage)
    process.exit(0)
  }

  const instance = new Gifer.Converter(GiferArgs.config)

  try {
    Log.write(`Converting ${GiferArgs.inName} to ${GiferArgs.outName}`)
    instance.convert(GiferArgs.inName, GiferArgs.outName, GiferArgs.verbose)
    Log.write(`Conversion complete!`)
    process.exit(0)
  } catch (error: any) {
    Log.write('Unable to convert Gif', (error as Error).name)
    if (
      (error as Error).name === 'PathExistsError' &&
      GiferArgs.overwrite === -1
    ) {
      Log.warn(
        `[WARN] ${GiferArgs.outName} already exists & --no-overwrite set - skipping. Use --overwrite to force overwriting the existing file.`
      )
      process.exit(0)
    } else {
      console.error(error)
      process.exit(1)
    }
  }
}

run()
