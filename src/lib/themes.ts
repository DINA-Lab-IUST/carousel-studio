import type { CSSProperties } from 'react'
import type { BackgroundStyle, Theme, ThemeTokens } from './types'

// ---------------------------------------------------------------------------
// Fonts (self-hosted via @fontsource so exports render identically offline)
// ---------------------------------------------------------------------------

export const FONT_INTER = "'Inter', ui-sans-serif, system-ui, sans-serif"
export const FONT_GROTESK = "'Space Grotesk', 'Inter', sans-serif"
export const FONT_PLAYFAIR = "'Playfair Display', Georgia, serif"
export const FONT_DM = "'DM Sans', 'Inter', sans-serif"
export const FONT_BASKERVILLE = "'Libre Baskerville', Georgia, serif"
export const FONT_BEBAS = "'Bebas Neue', 'Inter', sans-serif"
export const FONT_VAZIRMATN = "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
export const FONT_FIRA_CODE = "'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace"
/** Used when a theme predates the code-font token. */
export const FONT_CODE_MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

export const FONT_OPTIONS = [
  { label: 'Inter', value: FONT_INTER },
  { label: 'Space Grotesk', value: FONT_GROTESK },
  { label: 'Playfair Display', value: FONT_PLAYFAIR },
  { label: 'DM Sans', value: FONT_DM },
  { label: 'Libre Baskerville', value: FONT_BASKERVILLE },
  { label: 'Bebas Neue', value: FONT_BEBAS },
  { label: 'Vazirmatn (وزیرمتن)', value: FONT_VAZIRMATN },
  { label: 'Fira Code (کد)', value: FONT_FIRA_CODE },
]

/** Code blocks get their own short list — a code font should never be a display serif. */
export const CODE_FONT_OPTIONS = [
  { label: 'Fira Code', value: FONT_FIRA_CODE },
  { label: 'System monospace', value: FONT_CODE_MONO },
]

/**
 * Only these faces carry real Arabic-script coverage. Everything else renders
 * Persian with fallback boxes, so the design panel offers to switch instead.
 */
const PERSIAN_CAPABLE_FONTS = new Set([FONT_VAZIRMATN])

export function supportsPersian(font: string): boolean {
  return PERSIAN_CAPABLE_FONTS.has(font)
}

/** Resolves the monospace stack a code block should render with. */
export function resolveCodeFont(tokens: ThemeTokens): string {
  return tokens.fontCode || FONT_FIRA_CODE
}

// ---------------------------------------------------------------------------
// The theme set — small but deliberately designed
// ---------------------------------------------------------------------------

export const THEMES: Theme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Clean, quiet, confident',
    dark: false,
    tokens: {
      fontHeading: FONT_INTER,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.02em',
      bg: '#ffffff',
      surface: '#f6f6f7',
      text: '#111318',
      muted: '#6b7280',
      accent: '#111318',
      accentText: '#ffffff',
      border: '#e8e9ec',
      radius: '12px',
      padding: 88,
      shadow: 'none',
      background: 'solid',
      kickerStyle: 'bar',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Corporate-clean, trustworthy',
    dark: false,
    tokens: {
      fontHeading: FONT_DM,
      fontBody: FONT_DM,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.01em',
      bg: '#f6f8fb',
      surface: '#ffffff',
      text: '#0f2137',
      muted: '#5a6b7f',
      accent: '#2563eb',
      accentText: '#ffffff',
      border: '#dbe3ed',
      radius: '14px',
      padding: 88,
      shadow: '0 10px 30px -12px rgba(15, 33, 55, 0.25)',
      background: 'solid',
      kickerStyle: 'chip',
    },
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    tagline: 'Dark product-launch energy',
    dark: true,
    tokens: {
      fontHeading: FONT_GROTESK,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.02em',
      bg: '#0b1020',
      gradientTo: '#22d3ee',
      surface: '#141b31',
      text: '#e9edfa',
      muted: '#8b93ad',
      accent: '#6366f1',
      accentText: '#ffffff',
      border: '#222a45',
      radius: '16px',
      padding: 88,
      shadow: '0 16px 40px -18px rgba(0, 0, 0, 0.9)',
      background: 'glow',
      kickerStyle: 'bar',
    },
  },
  {
    id: 'dark-editorial',
    name: 'Dark Editorial',
    tagline: 'Magazine serif on ink',
    dark: true,
    tokens: {
      fontHeading: FONT_PLAYFAIR,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '0em',
      bg: '#0f0e0c',
      surface: '#191813',
      text: '#f6f2e9',
      muted: '#a49d8d',
      accent: '#d8b56a',
      accentText: '#191610',
      border: '#302d25',
      radius: '4px',
      padding: 96,
      shadow: 'none',
      background: 'solid',
      kickerStyle: 'bar',
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    tagline: 'Loud type, hard edges',
    dark: false,
    tokens: {
      fontHeading: FONT_BEBAS,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 400,
      bodyWeight: 500,
      headingCase: 'uppercase',
      headingTracking: '0.01em',
      bg: '#ffdd00',
      surface: '#ffffff',
      text: '#101010',
      muted: '#4a4636',
      accent: '#101010',
      accentText: '#ffdd00',
      border: '#101010',
      radius: '0px',
      padding: 84,
      shadow: '10px 10px 0 #101010',
      background: 'solid',
      kickerStyle: 'chip',
    },
  },
  {
    id: 'personal-brand',
    name: 'Personal Brand',
    tagline: 'Warm, approachable, human',
    dark: false,
    tokens: {
      fontHeading: FONT_DM,
      fontBody: FONT_DM,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.01em',
      bg: '#fff8f2',
      surface: '#ffffff',
      text: '#2a2118',
      muted: '#8a7b6c',
      accent: '#e8684a',
      accentText: '#ffffff',
      border: '#f1e4d8',
      radius: '24px',
      padding: 88,
      shadow: '0 14px 34px -16px rgba(120, 80, 60, 0.35)',
      background: 'dots',
      kickerStyle: 'chip',
    },
  },
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    tagline: 'Essay-like, calm and literary',
    dark: false,
    tokens: {
      fontHeading: FONT_BASKERVILLE,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '0em',
      bg: '#f8f3ea',
      surface: '#fffdf8',
      text: '#2e2a24',
      muted: '#7a7264',
      accent: '#4e6e58',
      accentText: '#ffffff',
      border: '#e4dbc9',
      radius: '6px',
      padding: 96,
      shadow: 'none',
      background: 'paper',
      kickerStyle: 'bar',
    },
  },
  {
    id: 'gradient-pop',
    name: 'Gradient Pop',
    tagline: 'Vivid launch-day gradient',
    dark: true,
    tokens: {
      fontHeading: FONT_INTER,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 800,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.03em',
      bg: '#1e1b4b',
      gradientTo: '#6366f1',
      surface: 'rgba(255, 255, 255, 0.10)',
      text: '#ffffff',
      muted: 'rgba(255, 255, 255, 0.72)',
      accent: '#ec4899',
      accentText: '#ffffff',
      border: 'rgba(255, 255, 255, 0.20)',
      radius: '20px',
      padding: 88,
      shadow: '0 20px 50px -20px rgba(0, 0, 0, 0.6)',
      background: 'gradient',
      kickerStyle: 'chip',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    tagline: 'Editorial black & white',
    dark: false,
    tokens: {
      fontHeading: FONT_GROTESK,
      fontBody: FONT_INTER,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 700,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: '-0.01em',
      bg: '#f4f4f5',
      surface: '#ffffff',
      text: '#18181b',
      muted: '#71717a',
      accent: '#18181b',
      accentText: '#fafafa',
      border: '#d4d4d8',
      radius: '8px',
      padding: 88,
      shadow: 'none',
      background: 'solid',
      kickerStyle: 'bar',
    },
  },
  {
    id: 'persian-tech',
    name: 'Persian Tech',
    tagline: 'Dark RTL starter for فارسی',
    dark: true,
    tokens: {
      fontHeading: FONT_VAZIRMATN,
      fontBody: FONT_VAZIRMATN,
      fontCode: FONT_FIRA_CODE,
      headingWeight: 800,
      bodyWeight: 400,
      headingCase: 'none',
      // Persian is a cursive script: letter-spacing would pull the joins apart.
      headingTracking: '0em',
      bg: '#0c1220',
      gradientTo: '#38bdf8',
      surface: '#131c30',
      text: '#eef2fb',
      muted: '#93a0bd',
      accent: '#2dd4bf',
      accentText: '#052e2b',
      border: '#1f2b45',
      radius: '14px',
      padding: 88,
      shadow: '0 16px 40px -18px rgba(0, 0, 0, 0.9)',
      background: 'glow',
      kickerStyle: 'bar',
    },
  },
]

export const DEFAULT_THEME_ID = 'professional'

/**
 * Starter themes that ship with Persian type. Selecting one flips the deck to
 * RTL so the reader gets a coherent right-to-left slide out of the box.
 */
const RTL_STARTER_THEME_IDS = new Set(['persian-tech'])

export function isRtlStarterTheme(id: string): boolean {
  return RTL_STARTER_THEME_IDS.has(id)
}

export function getTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}

/** Base theme tokens merged with the project's overrides. Content is never touched. */
export function resolveTheme(themeId: string, overrides: Partial<ThemeTokens> = {}): ThemeTokens {
  const merged = { ...getTheme(themeId).tokens, ...overrides }
  const clean: Partial<ThemeTokens> = {}
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== null && value !== '') {
      ;(clean as Record<string, unknown>)[key] = value
    }
  }
  return clean as ThemeTokens
}

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------

export function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(Math.max(0, Math.min(1, alpha)) * 100)}%, transparent)`
}

export function slideBackground(tokens: ThemeTokens): CSSProperties {
  const style: BackgroundStyle = tokens.background
  switch (style) {
    case 'gradient':
      return {
        backgroundColor: tokens.bg,
        backgroundImage: `linear-gradient(145deg, ${tokens.accent} 0%, ${tokens.gradientTo ?? tokens.bg} 100%)`,
      }
    case 'grid':
      return {
        backgroundColor: tokens.bg,
        backgroundImage: `linear-gradient(${withAlpha(tokens.border, 0.9)} 1px, transparent 1px), linear-gradient(90deg, ${withAlpha(tokens.border, 0.9)} 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }
    case 'dots':
      return {
        backgroundColor: tokens.bg,
        backgroundImage: `radial-gradient(${withAlpha(tokens.border, 1)} 2px, transparent 2px)`,
        backgroundSize: '38px 38px',
      }
    case 'glow':
      return {
        backgroundColor: tokens.bg,
        backgroundImage: `radial-gradient(900px 620px at 84% -12%, ${withAlpha(tokens.accent, 0.45)}, transparent 62%), radial-gradient(720px 520px at -12% 112%, ${withAlpha(tokens.gradientTo ?? tokens.accent, 0.32)}, transparent 62%)`,
      }
    case 'paper':
      return {
        backgroundColor: tokens.bg,
        backgroundImage: `radial-gradient(${withAlpha(tokens.border, 0.85)} 1.2px, transparent 0)`,
        backgroundSize: '22px 22px',
      }
    default:
      return { backgroundColor: tokens.bg }
  }
}

export const BG_STYLE_OPTIONS: { label: string; value: BackgroundStyle }[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Glow', value: 'glow' },
  { label: 'Grid', value: 'grid' },
  { label: 'Dots', value: 'dots' },
  { label: 'Paper', value: 'paper' },
]

export const RADIUS_OPTIONS = [
  { label: 'Sharp', value: '0px' },
  { label: 'Subtle', value: '8px' },
  { label: 'Soft', value: '16px' },
  { label: 'Round', value: '24px' },
  { label: 'Pill', value: '32px' },
]
