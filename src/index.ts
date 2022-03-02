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
    await instance.convert(
      GiferArgs.inName,
      GiferArgs.outName,
      GiferArgs.verbose
    )
  } catch (error) {
    Log.write('Unable to convert Gif')
    console.error(error)
  }
}

run()
