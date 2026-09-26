// Core document model for Carousel Studio.
// Everything the editor renders is derived from these structures — no hardcoded slides.

export type Align = 'left' | 'center' | 'right'
export type CalloutTone = 'info' | 'success' | 'warning'
export type ImageFit = 'cover' | 'contain'

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'list'
  | 'image'
  | 'icon'
  | 'statistic'
  | 'comparison'
  | 'callout'
  | 'cta'

/**
 * A reusable content block. Slides are composed from these, so adding a block
 * type means adding one variant here plus one renderer — nothing else changes.
 */
export type Block =
  | { id: string; type: 'heading'; text: string; align?: Align }
  | { id: string; type: 'paragraph'; text: string; align?: Align }
  | { id: string; type: 'quote'; text: string; attribution?: string }
  | { id: string; type: 'list'; items: string[]; ordered?: boolean }
  | { id: string; type: 'image'; src?: string; alt?: string; fit?: ImageFit }
  | { id: string; type: 'icon'; icon: string; label?: string }
  | { id: string; type: 'statistic'; value: string; label?: string; caption?: string }
  | {
      id: string
      type: 'comparison'
      leftLabel: string
      rightLabel: string
      leftItems: string[]
      rightItems: string[]
    }
  | { id: string; type: 'callout'; text: string; tone: CalloutTone }
  | { id: string; type: 'cta'; text: string; subtext?: string }

/** Layouts are named arrangements: they control alignment, type scale and spacing. */
export type LayoutId =
  | 'cover'
  | 'statement'
  | 'body'
  | 'list'
  | 'quote'
  | 'stat'
  | 'compare'
  | 'callout'
  | 'cta'

export interface Slide {
  id: string
  layout: LayoutId
  blocks: Block[]
}

export type PlatformId =
  | 'linkedin-portrait'
  | 'linkedin-square'
  | 'instagram-portrait'
  | 'instagram-square'

export interface PlatformPreset {
  id: PlatformId
  label: string
  group: string
  width: number
  height: number
}

export type BackgroundStyle = 'solid' | 'gradient' | 'grid' | 'dots' | 'glow' | 'paper'
export type KickerStyle = 'none' | 'bar' | 'chip'

/** Every visual decision a slide renderer makes comes from these tokens. */
export interface ThemeTokens {
  fontHeading: string
  fontBody: string
  headingWeight: number
  bodyWeight: number
  headingCase: 'none' | 'uppercase'
  headingTracking: string
  bg: string
  gradientTo?: string
  surface: string
  text: string
  muted: string
  accent: string
  accentText: string
  border: string
  radius: string
  /** Slide inner padding in px at a 1080px-wide slide. */
  padding: number
  shadow: string
  background: BackgroundStyle
  kickerStyle: KickerStyle
}

export interface Theme {
  id: string
  name: string
  tagline: string
  dark: boolean
  tokens: ThemeTokens
}

export interface ProjectDesign {
  themeId: string
  overrides: Partial<ThemeTokens>
  platformId: PlatformId
  kicker: string
  showSlideNumbers: boolean
  showLogo: boolean
}

export interface Project {
  id: string
  title: string
  design: ProjectDesign
  slides: Slide[]
  logoUrl?: string
  createdAt: number
  updatedAt: number
}

/** Reusable brand settings, persisted locally and applied into a project's overrides. */
export interface BrandKit {
  name: string
  color: string
  font: string
  logoUrl?: string
}
