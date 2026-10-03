import {
  mdiCodeJson,
  mdiDatabaseOutline,
  mdiEmailOutline,
  mdiLanguageCpp,
  mdiLanguageCss3,
  mdiLanguageCsharp,
  mdiLanguageGo,
  mdiLanguageJava,
  mdiLinkedin,
  mdiWeb,
} from '@mdi/js'
import {
  siGithub,
  siGnubash,
  siHtml5,
  siInstagram,
  siJavascript,
  siPython,
  siReact,
  siRust,
  siTelegram,
  siTypescript,
  siX,
} from 'simple-icons'

import type { CodeLanguage, SocialKey } from './types'

/**
 * Brand marks for the code window tab.
 *
 * Every mark is a bare vector path: no tile, no `<rect>`, no backdrop. The root
 * `<svg>` is `fill="none"` and each path carries its own brand colour, so the
 * glyph sits directly on the tab bar — dark or light — with nothing behind it.
 * That also keeps the tab from growing a white notch next to the traffic lights.
 *
 * Geometry comes from Simple Icons (CC0) and MDI (Apache-2.0), so the shapes are
 * the real ones rather than hand-drawn lookalikes. All of it is inline, with no
 * external references, filters or raster data, because `html-to-image` clones the
 * slide into a `<foreignObject>` for PNG/PDF export and only inlined vectors
 * survive that trip without a CORS request.
 */

/**
 * Which surface the mark is drawn on. Several brand colours (yellow, cyan, pure
 * black) lose their edge on one background or the other, so they need a hint.
 */
export type LogoTone = 'light' | 'dark'

export interface CodeLogoProps {
  size?: number
  className?: string
  /** Colour of the surface behind the mark. Defaults to the dark code window. */
  tone?: LogoTone
}

export interface SocialIconProps {
  d: string
  color: string
  /** Ink to use on dark backgrounds, for marks that are black by default. */
  darkColor?: string
}

interface GlyphProps extends CodeLogoProps {
  /** The vector path(s). Several subpaths in one `d` are fine. */
  d: string
  /** Brand colour of the glyph. */
  ink: string
  /**
   * Outline added on light backgrounds so low-contrast brands keep an edge.
   * Only used where the brand colour is too pale to read on white.
   */
  edge?: string
}

/** One bare path on a transparent canvas — the whole logo vocabulary. */
function Glyph({ d, ink, edge, size = 18, className }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill={ink}
        {...(edge ? { stroke: edge, strokeWidth: 0.5, strokeLinejoin: 'round' as const } : null)}
      />
    </svg>
  )
}

/** The cyan atom, straight from the official mark. */
export function ReactLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siReact.path} ink={`#${siReact.hex}`} edge={tone === 'light' ? '#0b7285' : undefined} size={size} className={className} />
}

/** Blue tile with the letters knocked out, which is the official TypeScript mark. */
export function TypeScriptLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siTypescript.path} ink={`#${siTypescript.hex}`} edge={tone === 'light' ? '#17527f' : undefined} size={size} className={className} />
}

/** Yellow tile with "JS" cut through it. */
export function JavaScriptLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siJavascript.path} ink={`#${siJavascript.hex}`} edge={tone === 'light' ? '#8a6d00' : undefined} size={size} className={className} />
}

/** Two interlocking snakes: the yellow one behind, nudged down-right. */
export function PythonLogo({ size = 18, className }: CodeLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d={siPython.path} transform="translate(1.1 1.1)" fill="#ffd43b" />
      <path d={siPython.path} fill="#387eb8" />
    </svg>
  )
}

/** The official Java path, split at the steam so each half can take its own colour. */
const JAVA_PARTS = mdiLanguageJava.split('M').filter(Boolean)
const join = (parts: string[]) => parts.map((part) => `M${part}`).join('')

/**
 * The Java cup is genuinely two-tone: red steam above a blue cup and saucer.
 * The official MDI path arrives as one string, so the steam subpaths are lifted
 * out and tinted separately rather than approximated by hand.
 */
export function JavaLogo({ size = 18, className }: CodeLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d={join(JAVA_PARTS.slice(0, 2))} fill="#e76f00" />
      <path d={join(JAVA_PARTS.slice(2))} fill="#5382a1" />
    </svg>
  )
}

export function CSharpLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiLanguageCsharp} ink="#68217a" edge={tone === 'light' ? '#3d0d49' : undefined} size={size} className={className} />
}

export function CppLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiLanguageCpp} ink="#00599c" edge={tone === 'light' ? '#00365c' : undefined} size={size} className={className} />
}

/** The gopher, not the wordmark. */
export function GoLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiLanguageGo} ink="#00add8" edge={tone === 'light' ? '#005f75' : undefined} size={size} className={className} />
}

/**
 * Rust's gear is pure black, so it inverts with the surface: white-ish on a dark
 * tab, true black on a light one. Neither is a backdrop — just the glyph ink.
 */
export function RustLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siRust.path} ink={tone === 'dark' ? '#e4e4e7' : '#000000'} size={size} className={className} />
}

/** The orange shield, with the "5" cut out of it. */
export function HtmlLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siHtml5.path} ink={`#${siHtml5.hex}`} edge={tone === 'light' ? '#a02813' : undefined} size={size} className={className} />
}

/** The blue CSS shield with its "3". */
export function CssLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiLanguageCss3} ink="#264de4" edge={tone === 'light' ? '#12308c' : undefined} size={size} className={className} />
}

/** A database cylinder. SQL has no official mark of its own. */
export function SqlLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiDatabaseOutline} ink="#0f766e" edge={tone === 'light' ? '#06433d' : undefined} size={size} className={className} />
}

export function BashLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={siGnubash.path} ink={`#${siGnubash.hex}`} edge={tone === 'light' ? '#2c5a12' : undefined} size={size} className={className} />
}

export function JsonLogo({ size = 18, className, tone = 'dark' }: CodeLogoProps) {
  return <Glyph d={mdiCodeJson} ink={tone === 'dark' ? '#f59e0b' : '#b45309'} size={size} className={className} />
}

/** One entry per language, so the renderer never has to branch. */
export const CODE_LOGOS: Record<CodeLanguage, (props: CodeLogoProps) => React.JSX.Element> = {
  tsx: ReactLogo,
  jsx: ReactLogo,
  typescript: TypeScriptLogo,
  javascript: JavaScriptLogo,
  python: PythonLogo,
  java: JavaLogo,
  csharp: CSharpLogo,
  cpp: CppLogo,
  go: GoLogo,
  rust: RustLogo,
  html: HtmlLogo,
  css: CssLogo,
  json: JsonLogo,
  sql: SqlLogo,
  bash: BashLogo,
}

export function CodeLogo({
  language,
  size = 18,
  className,
  tone = 'dark',
}: CodeLogoProps & { language: CodeLanguage }) {
  const Logo = CODE_LOGOS[language] ?? JsonLogo
  return <Logo size={size} className={className} tone={tone} />
}

/**
 * Brand marks for the social grid on the outro card. Bare paths in their own
 * brand colour, so they need no tile either.
 */
export const SOCIAL_ICONS: Record<SocialKey, SocialIconProps> = {
  linkedin: { d: mdiLinkedin, color: '#0a66c2' },
  github: { d: siGithub.path, color: '#181717', darkColor: '#e6edf3' },
  telegram: { d: siTelegram.path, color: `#${siTelegram.hex}` },
  twitter: { d: siX.path, color: '#000000', darkColor: '#ffffff' },
  instagram: { d: siInstagram.path, color: `#${siInstagram.hex}` },
  email: { d: mdiEmailOutline, color: '#ea4335' },
  website: { d: mdiWeb, color: '#0f766e' },
}

export function SocialIcon({
  id,
  size = 20,
  className,
  onDark = false,
}: {
  id: SocialKey
  size?: number
  className?: string
  onDark?: boolean
}) {
  const icon = SOCIAL_ICONS[id]
  if (!icon) return null
  return <Glyph d={icon.d} ink={onDark ? icon.darkColor ?? icon.color : icon.color} size={size} className={className} />
}