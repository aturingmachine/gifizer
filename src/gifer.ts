import execa, { ExecaSyncReturnValue } from 'execa'
import { Log } from './args'
import { DitherTypes, DitherConfig, Dither } from './dither'
import { dump, pathExists } from './utils'

class PathExistsError extends Error {
  constructor(outPath: string) {
    super(
      `PATH ALREADY EXISTS: ${outPath} already exists. Use the --overwrite flag to forve an overwrite of the existing file, or use the --no-overwrite flag to skip existing paths without failing.`
    )
    this.name = 'PathExistsError'
  }
}

export type GiferParams = {
  framerate?: number | 'variable'
  scale?: [number, number]
  max_colors?: number | 'none' | 'variable'
  dither?: DitherTypes | DitherConfig
  overwrite?: -1 | 0 | 1
  select?: FPSSkips | 'variable'
}

export enum FPSSkips {
  Hard = 'hard',
  Medium = 'medium',
  Small = 'small',
}

function getFrameRate(path: string): number {
  const out = execa.sync('/usr/bin/ffprobe', [
    '-v',
    '0',
    '-of',
    'csv=p=0',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=r_frame_rate',
    path,
  ])

  return parseInt(out.stdout.split('/')[0], 10)
}

function getStep(skips: FPSSkips): number {
  let divisor: number

  switch (skips) {
    case FPSSkips.Hard:
      divisor = 4
      break
    case FPSSkips.Medium:
      divisor = 3
      break
    case FPSSkips.Small:
      divisor = 2
      break
  }

  return divisor
}

function getColors(path: string): string {
  return execa
    .sync('/usr/bin/mediainfo', [
      'mediainfo',
      path,
      '--inform="Video;%colour_range%"',
    ])
    .stdout.toLowerCase()
}

export class Converter {
  private select: FPSSkips | 'variable' | undefined
  private _framerate: number | 'variable'
  private scale: [number, number]
  private max_colors: number | 'none' | 'variable'
  private dither: Dither

  constructor(readonly config: GiferParams) {
    this._framerate = config.framerate || 16
    this.scale = config.scale || [320, -1]
    this.max_colors = config.max_colors || 32
    this.dither = new Dither(
      typeof config.dither === 'string'
        ? {
            type: config.dither,
          }
        : config.dither || Dither.DefaultDither
    )
    this.select = config.select
  }

  get _select(): string {
    if (!this.select || this.select === 'variable') {
      return ''
    }

    const step = getStep(this.select)
    // eslint-disable-next-line prettier/prettier
    return `select=not(mod(n\\,${step})),`
  }

  getFramerate(path: string): number {
    if (this._framerate === 'variable') {
      return getFrameRate(path)
    }

    return this._framerate
  }

  _maxColors(path: string): string {
    switch (this.max_colors) {
      case 'none':
        return ''
      case 'variable':
        const max = getColors(path) === 'limited' ? '16' : '32'
        return `=max_colors=${max}`
      default:
        return `=max_colors=${this.max_colors}`
    }
  }

  get _scale(): string {
    return `scale=${this.scale[0]}:${this.scale[1]}`
  }

  filter_complex(path: string): string {
    const framerate = this.getFramerate(path)
    const colors = this._maxColors(path)
    return `${this._select}framerate=fps=${framerate},${this._scale}:flags=lanczos,split [o1] [o2];[o1] palettegen${colors} [p]; [o2] fifo [o3];[o3] [p] paletteuse${this.dither.asOptions}`
  }

  get overwrite(): string {
    let val = ''

    switch (this.config.overwrite) {
      case 1:
        val = '-y'
        break
      case -1:
        val = '-n'
        break
      case 0:
      default:
        break
    }

    return val
  }

  convert(
    inputPath: string,
    outputPath: string,
    isVerbose = false
  ): ExecaSyncReturnValue<string> {
    Log.debug(
      `${dump('final GiferOptions: ', {
        select: this.select,
        framerate: this._framerate,
        max_colors: this.max_colors,
        scale: this.scale,
        dither: this.dither,
      })}`
    )

    const args = [
      this.overwrite,
      // '-loop',
      // '0',
      '-i',
      inputPath,
      '-filter_complex',
      this.filter_complex(inputPath),
      outputPath,
    ].filter(Boolean)

    Log.debug(`ffmpeg args: ${args.join(' ')}\n`)

    try {
      return execa.sync('/usr/bin/ffmpeg', args, {
        stdio: isVerbose ? 'inherit' : 'ignore',
      })
    } catch (error) {
      if (
        !!this.config.overwrite &&
        this.config.overwrite < 1 &&
        pathExists(outputPath)
      ) {
        throw new PathExistsError(outputPath)
      }

      throw error
    }
  }
}
