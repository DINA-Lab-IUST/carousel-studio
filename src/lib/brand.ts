import type { BrandKit } from './types'

const STORAGE_KEY = 'carousel-studio.brand.v1'

export function loadBrandKit(): BrandKit | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as BrandKit
    if (!parsed || typeof parsed.name !== 'string') return undefined
    return parsed
  } catch {
    return undefined
  }
}

export function saveBrandKit(kit: BrandKit): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kit))
  } catch {
    // Storage can be unavailable (private mode) — the editor keeps working.
  }
}
