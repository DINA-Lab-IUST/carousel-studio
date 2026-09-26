import { createSlide } from './blocks'
import { newId } from './ids'
import { DEFAULT_PLATFORM } from './platforms'
import { DEFAULT_THEME_ID } from './themes'
import type { PlatformId, Project, Slide } from './types'

export interface CreateProjectInput {
  title: string
  slides?: Slide[]
  platformId?: PlatformId
  themeId?: string
  kicker?: string
  logoUrl?: string
}

export function createProject(input: CreateProjectInput): Project {
  const now = Date.now()
  return {
    id: newId('prj'),
    title: input.title.trim() || 'Untitled carousel',
    design: {
      themeId: input.themeId ?? DEFAULT_THEME_ID,
      overrides: {},
      platformId: input.platformId ?? DEFAULT_PLATFORM,
      kicker: input.kicker ?? '',
      showSlideNumbers: true,
      showLogo: false,
    },
    slides: input.slides ?? createStarterSlides(),
    logoUrl: input.logoUrl,
    createdAt: now,
    updatedAt: now,
  }
}

/** A blank project still starts with a usable carousel shape. */
export function createStarterSlides(): Slide[] {
  return [createSlide('cover'), createSlide('body'), createSlide('cta')]
}
