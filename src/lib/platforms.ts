import type { PlatformId, PlatformPreset } from './types'

/**
 * Platform presets are intentionally abstract: the renderer only ever reads
 * width/height, so new networks are one entry here.
 */
export const PLATFORMS: PlatformPreset[] = [
  { id: 'linkedin-portrait', label: 'LinkedIn · Portrait', group: 'LinkedIn', width: 1080, height: 1350 },
  { id: 'linkedin-square', label: 'LinkedIn · Square', group: 'LinkedIn', width: 1080, height: 1080 },
  { id: 'instagram-portrait', label: 'Instagram · Portrait', group: 'Instagram', width: 1080, height: 1350 },
  { id: 'instagram-square', label: 'Instagram · Square', group: 'Instagram', width: 1080, height: 1080 },
]

export const DEFAULT_PLATFORM: PlatformId = 'linkedin-portrait'

export function getPlatform(id: PlatformId): PlatformPreset {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]
}
