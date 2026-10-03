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
  | 'code'

/** Languages the built-in tokenizer understands. */
export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'tsx'
  | 'jsx'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'bash'
  | 'rust'
  | 'go'
  | 'sql'
  | 'java'
  | 'csharp'
  | 'cpp'

/** A code block reads either as an IDE window or as a recorded shell session. */
export type CodeBlockMode = 'editor' | 'terminal'

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
  | {
      id: string
      type: 'code'
      /** The snippet (editor mode) or the whole session transcript (terminal mode). */
      code: string
      mode: CodeBlockMode
      language: CodeLanguage
      filename?: string
      showLineNumbers?: boolean
      terminalPrompt?: string
      /** Titlebar text for a terminal session, e.g. `zsh — ~/carousel-studio`. */
      terminalTitle?: string
      themeVariant?: 'dark' | 'light' | 'theme-match'
    }

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
/** Reading order for a slide. Persian decks run right-to-left; everything else is ltr. */
export type TextDirection = 'ltr' | 'rtl'
export type KickerStyle = 'none' | 'bar' | 'chip'

/** Every visual decision a slide renderer makes comes from these tokens. */
export interface ThemeTokens {
  fontHeading: string
  fontBody: string
  /** Monospace stack for code and terminal blocks. Never inherits the slide direction. */
  fontCode?: string
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

/**
 * Where the author can be found. Values are stored the way people type them
 * ("in/username", "@user", "user@site.com"); the outro card renders them verbatim.
 */
export interface AuthorSocials {
  linkedin?: string
  github?: string
  twitter?: string
  instagram?: string
  telegram?: string
  website?: string
  email?: string
}

export type SocialKey = keyof AuthorSocials

/** Who is publishing the carousel. Rendered on the cover and the closing slide. */
export interface AuthorProfile {
  name: string
  role?: string
  handle?: string
  avatarUrl?: string
  socials?: AuthorSocials
}

export interface ProjectDesign {
  themeId: string
  overrides: Partial<ThemeTokens>
  platformId: PlatformId
  kicker: string
  showSlideNumbers: boolean
  showLogo: boolean
  /** Defaults to 'ltr'. */
  direction?: TextDirection
  /** Author bar on the cover slide, richer card on the closing slide. */
  showAuthor?: boolean
  author?: AuthorProfile
  /** Circular lab emblem in the slide header. */
  showLabBadge?: boolean
  labLogoUrl?: string
  /** Rich contact card with socials on the last slide. Implies showAuthor. */
  showOutroSlide?: boolean
  /** Overrides the default save-and-share call to action. */
  outroCtaText?: string
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
