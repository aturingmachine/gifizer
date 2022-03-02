import { resolve } from 'path'
import minimist from 'minimist'
import * as Gifer from './gifer'
import { PresetNames, Presets } from './presets'

async function run(): Promise<void> {
  const args = minimist(process.argv.slice(2), {
    alias: {
      help: ['h'],
      overwrite: ['f', 'o'],
    },
    boolean: ['overwrite', 'help'],
  })

  if (args.h || args.help) {
    console.log('Help Message')
    process.exit(0)
  }

  let parsed: Gifer.GiferParams

  if (args.preset) {
    parsed = { ...args, ...Presets[args.preset as PresetNames] }
  } else {
    parsed = {
      scale: args.scale ? args.scale.split(':') : undefined,
      framerate: args.framerate,
      max_colors: args.max_colors,
      dither: args.dither,
      overwrite: args.overwrite,
    }
  }

  const inName = resolve(__dirname, args._[0])
  const outName = resolve(args._[1])

  const instance = new Gifer.Converter(parsed as Gifer.GiferParams)

  try {
    await instance.convert(inName, outName)
  } catch (error) {
    console.error('Unable to convert Gif')
    console.error(error)
  }
}

run()
