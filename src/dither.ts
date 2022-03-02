export enum DitherTypes {
  Bayer = 'bayer',
  Heckbert = 'heckbert',
  FloydSteinberg = 'floyd_steinberg',
  Sierra2 = 'sierra2',
  Sierra24A = 'sierra2_4a',
}

export type DitherConfig = {
  type: DitherTypes
  // Pull a new color pallete for each frame
  new?: boolean
  // 0-5; default 2; only for bayer dithering
  bayer_scale?: number
  // 0-255; default 128
  alpha_threshold?: number
  // Will disable alpha_threshold if used
  use_alpha?: boolean
}

export class Dither {
  constructor(readonly config: DitherConfig) {
    if (!Object.values(DitherTypes).includes(config.type)) {
      throw new Error(
        `${
          config.type
        } is not a valid Dither Type. Valid types are ${Object.values(
          DitherTypes
        ).join(', ')}`
      )
    }
  }

  get type(): DitherTypes {
    return this.config.type
  }

  get asOptions(): string {
    return Object.keys(this.config)
      .filter((key) => !['type', 'config'].includes(key))
      .reduce((prev, curr) => {
        const value = this.config[curr as keyof DitherConfig]

        return prev.concat(`:${curr}=${value}`)
      }, `=dither=${this.type}`)
  }

  static get DefaultDither(): Dither {
    return new Dither({
      type: DitherTypes.Sierra24A,
    })
  }
}
