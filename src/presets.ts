import { DitherTypes } from './dither'
import { FPSSkips, GiferParams } from './gifer'

export enum PresetNames {
  Fast = 'fast',
  HighQuality = 'high-quality',
  Balanced = 'balanced',
  Low = 'low',
}

const LowPreset: GiferParams = {
  framerate: 12,
  scale: [320, -1],
  max_colors: 12,
  select: FPSSkips.Hard,
  dither: {
    type: DitherTypes.Bayer,
    bayer_scale: 5,
  },
}

const FastPreset: GiferParams = {
  framerate: 16,
  scale: [320, -1],
  max_colors: 18,
  select: FPSSkips.Small,
  dither: {
    type: DitherTypes.Bayer,
    bayer_scale: 3,
  },
}

const HighQualityPreset: GiferParams = {
  framerate: 'variable',
  scale: [320, -1],
  max_colors: 'none',
  dither: {
    type: DitherTypes.Sierra24A,
    new: true,
  },
}

const BalancedPreset: GiferParams = {
  framerate: 20,
  scale: [320, -1],
  max_colors: 36,
  dither: {
    type: DitherTypes.Bayer,
    bayer_scale: 2,
    new: true,
  },
}

export const Presets: Record<PresetNames, GiferParams> = {
  fast: FastPreset,
  'high-quality': HighQualityPreset,
  balanced: BalancedPreset,
  low: LowPreset,
}
