import { resolve } from 'path'
import minimist from 'minimist'
import { readCustomConfigs } from './config'
import { GiferParams } from './gifer'
import { Presets, PresetNames } from './presets'
import { dump } from './utils'

export class Args {
  private static MinimistOpts = {
    alias: {
      help: ['h'],
      overwrite: ['f', 'o', 'force'],
      debug: ['d'],
      verbose: ['v'],
      'no-overwrite': ['n'],
    },
    boolean: ['overwrite', 'help', 'debug', 'verbose', 'no-overwrite'],
  }

  private readonly _args

  public readonly help: boolean
  public readonly debug!: boolean
  public readonly verbose!: boolean
  public readonly overwrite!: -1 | 0 | 1
  public readonly preset!: boolean
  public readonly inName!: string
  public readonly outName!: string

  public readonly config!: GiferParams

  constructor(private readonly argv: string[]) {
    this._args = minimist(this.argv.slice(2), Args.MinimistOpts)

    this.help = this._args.h || this._args.help

    if (!this.help) {
      this.verbose = this._args.verbose || this._args.v
      this.debug = this._args.debug || this._args.d || this.verbose

      Log.init(this.debug)

      this.overwrite = Args.parseOverwrite(
        !!(
          this._args.overwrite ||
          this._args.o ||
          this._args.f ||
          this._args.force
        ),
        !!this._args['no-overwrite']
      )
      this.preset = this._args.preset

      this.config = this.buildConfig()

      this.inName = resolve(__dirname, this._args._[0])

      const hasOut = !!this._args._[1]
      // generate the outfile name if one was not provided
      this.outName = hasOut
        ? resolve(this._args._[1])
        : this.inName + '_out.gif'

      if (!hasOut) {
        Log.debug(`using generated outname: ${this.outName}`)
      }

      Log.debug(
        `preset: ${this.preset}, overwrite: ${this.overwrite}, inName: ${this.inName}, outName: ${this.outName}`
      )
      Log.debug(dump('Parsed Config:', this.config))
    }
  }

  private buildConfig(): GiferParams {
    if (this.preset) {
      const builtIn = Presets[this._args.preset as PresetNames]
      const custom = Args.customConfs[this._args.preset]

      if (!custom && !builtIn) {
        throw new Error(
          `Invalid preset - ${this._args.preset} does not match any builtin or custom presets`
        )
      }

      return {
        ...this._args,
        overwrite: this.overwrite,
        ...(custom || builtIn),
      }
    } else {
      Log.debug('no preset set - using a la carte args and defaults')
      return {
        scale: this._args.scale ? this._args.scale.split(':') : undefined,
        framerate: this._args.framerate,
        max_colors: this._args.max_colors,
        dither: this._args.dither,
        overwrite: this.overwrite,
      }
    }
  }

  private static parseOverwrite(
    overwrite: boolean,
    noOverwrite: boolean
  ): -1 | 0 | 1 {
    if (!noOverwrite) {
      return overwrite ? 1 : 0
    }

    return -1
  }

  private static get customConfs(): Record<string, GiferParams> {
    return readCustomConfigs()
  }
}

export class Log {
  private static isDebug: boolean

  static init(isDebug: boolean): void {
    Log.isDebug = isDebug
  }

  static write(...args: unknown[]): void {
    console.log(...args)
  }

  static warn(...args: unknown[]): void {
    console.warn(...args)
  }

  static debug(...args: unknown[]): void {
    if (this.isDebug) {
      console.log('[DEBUG]', ...args)
    }
  }
}
