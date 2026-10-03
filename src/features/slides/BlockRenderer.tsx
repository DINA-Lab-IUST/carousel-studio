import { AlertTriangle, CheckCircle2, Image as ImageIcon, Info, SquareTerminal } from 'lucide-react'
import type { CSSProperties } from 'react'

import { CodeLogo } from '../../lib/codeLogos'
import {
  DARK_PALETTE,
  detectLanguageFromFilename,
  highlightCode,
  highlightTerminal,
  isDarkColor,
  LANGUAGE_LABELS,
  LIGHT_PALETTE,
  type HighlightPalette,
  type Token,
} from '../../lib/highlight'
import { getIcon } from '../../lib/icons'
import { resolveCodeFont, withAlpha } from '../../lib/themes'
import type { Block, TextDirection, ThemeTokens } from '../../lib/types'
import { cn, toPersianDigits } from '../../lib/utils'
import { EditableText } from './EditableText'

export type Variant = 'display' | 'title' | 'section' | 'subtitle' | 'body'

const TYPE_SCALE: Record<Variant, number> = {
  display: 74,
  title: 52,
  section: 40,
  subtitle: 34,
  body: 28,
}

const TONE_ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle }

type CodeBlock = Extract<Block, { type: 'code' }>

/** The macOS window controls, in their canonical order. */
const TRAFFIC_LIGHTS = ['#ff5f56', '#ffbd2e', '#27c93f']

interface WindowChrome {
  shell: string
  header: string
  border: string
  gutter: string
  gutterBg: string
  shadow: string
  dark: boolean
}

const DARK_CHROME: WindowChrome = {
  shell: '#21252b',
  header: '#2c313a',
  border: '#171a1f',
  gutter: '#5c6370',
  gutterBg: '#1b1e24',
  shadow: '0 18px 44px -14px rgba(0, 0, 0, 0.55)',
  dark: true,
}

const LIGHT_CHROME: WindowChrome = {
  shell: '#ffffff',
  header: '#f2f4f7',
  border: '#d7dce3',
  gutter: '#98a1ad',
  gutterBg: '#f7f9fb',
  shadow: '0 18px 44px -18px rgba(15, 23, 42, 0.22)',
  dark: false,
}

/** 'theme-match' lets the window borrow the slide's own surface and border. */
function resolveChrome(tokens: ThemeTokens, variant: CodeBlock['themeVariant']): WindowChrome {
  if (variant === 'dark') return DARK_CHROME
  if (variant === 'light') return LIGHT_CHROME
  return isDarkColor(tokens.bg)
    ? {
        shell: withAlpha(tokens.text, 0.1),
        header: withAlpha(tokens.text, 0.14),
        border: withAlpha(tokens.text, 0.24),
        gutter: tokens.muted,
        gutterBg: withAlpha(tokens.text, 0.06),
        shadow: tokens.shadow === 'none' ? DARK_CHROME.shadow : tokens.shadow,
        dark: true,
      }
    : {
        shell: tokens.surface,
        header: withAlpha(tokens.text, 0.05),
        border: tokens.border,
        gutter: tokens.muted,
        gutterBg: withAlpha(tokens.text, 0.03),
        shadow: tokens.shadow === 'none' ? LIGHT_CHROME.shadow : tokens.shadow,
        dark: false,
      }
}

/** Tokens paint as plain spans so the slide rasterizes with no extra machinery. */
function TokenRun({ tokens, palette }: { tokens: Token[]; palette: HighlightPalette }) {
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} style={{ color: palette[token.kind] }}>
          {token.text}
        </span>
      ))}
    </>
  )
}

const CODE_FONT_SIZE = 21
const CODE_LINE_HEIGHT = 1.55

/**
 * Code and terminal blocks are a deliberate island inside the slide.
 *
 * Source code is read left to right in every language we ship, so this window
 * pins its own `dir`, alignment and monospace font rather than inheriting the
 * slide's direction — an RTL Persian deck still shows a left-aligned snippet.
 */
function CodeWindow({
  block,
  tokens,
  unit,
  interactive,
  onPatch,
}: {
  block: CodeBlock
  tokens: ThemeTokens
  unit: number
  interactive: boolean
  onPatch?: (patch: Record<string, unknown>) => void
}) {
  const chrome = resolveChrome(tokens, block.themeVariant)
  const palette = chrome.dark ? DARK_PALETTE : LIGHT_PALETTE
  const terminal = block.mode === 'terminal'
  const filename = block.filename ?? ''
  const codeFont = resolveCodeFont(tokens)
  // A terminal has no file to name, so the titlebar shows the session instead.
  const sessionTitle = terminal
    ? block.terminalTitle?.trim() || `zsh — ${block.terminalPrompt?.trim() || '~'}`
    : ''

  /**
   * The snippet is always painted as highlighted tokens, on the canvas and in
   * the export alike. Editing happens in the ContentPanel, or on the tab label
   * here — the code body itself stays a faithful picture of the syntax.
   */
  const rename = (value: string) => {
    const detected = detectLanguageFromFilename(value)
    onPatch?.(detected ? { filename: value, language: detected } : { filename: value })
  }

  // Nothing inside the window may inherit the slide's reading direction.
  const isolation: CSSProperties = {
    direction: 'ltr',
    textAlign: 'left',
    fontFamily: codeFont,
    unicodeBidi: 'isolate',
  }

  // Terminal transcripts read as a session; a line is a command only if it carries a marker.
  const rows = terminal
    ? highlightTerminal(block.code, block.terminalPrompt ?? '').map((line) => line.tokens)
    : highlightCode(block.code, block.language)
  const lineNumbers = block.code.split('\n')
  const showNumbers = !terminal && (block.showLineNumbers ?? true)

  const fontSize = CODE_FONT_SIZE * unit
  const bodyPadding = 26 * unit
  const lineStyle: CSSProperties = {
    ...isolation,
    fontSize,
    lineHeight: CODE_LINE_HEIGHT,
    color: palette.plain,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
  const titleStyle: CSSProperties = {
    ...isolation,
    display: 'block',
    minWidth: 0,
    fontSize: 19 * unit,
    fontWeight: 500,
    color: chrome.dark ? '#d7dae0' : '#24292f',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  return (
    <div
      dir="ltr"
      style={{
        ...isolation,
        width: '100%',
        borderRadius: 16 * unit,
        border: `1px solid ${chrome.border}`,
        background: chrome.shell,
        boxShadow: chrome.shadow,
        overflow: 'hidden',
      }}
    >
      <div
        dir="ltr"
        style={{
          ...isolation,
          display: 'flex',
          alignItems: 'center',
          gap: 16 * unit,
          padding: `${13 * unit}px ${18 * unit}px`,
          background: chrome.header,
          borderBottom: `1px solid ${chrome.border}`,
        }}
      >
        <span style={{ display: 'flex', gap: 8 * unit, flexShrink: 0 }}>
          {TRAFFIC_LIGHTS.map((color) => (
            <span
              key={color}
              style={{ width: 12 * unit, height: 12 * unit, borderRadius: 999, background: color }}
            />
          ))}
        </span>

        {terminal ? (
          /* Terminals get a unified titlebar: no tab, no file name, no badge. */
          <span
            style={{
              ...isolation,
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8 * unit,
              fontSize: 17 * unit,
              fontWeight: 500,
              color: chrome.dark ? '#9aa5b1' : '#57606a',
            }}
          >
            <SquareTerminal size={16 * unit} strokeWidth={1.75} style={{ flexShrink: 0, opacity: 0.8 }} />
            <span
              style={{
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {sessionTitle}
            </span>
          </span>
        ) : (
          /* The active file tab: it sits flush against the body so it reads as a real tab. */
          <div
            dir="ltr"
            style={{
              ...isolation,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * unit,
              marginBottom: -13 * unit - 1,
              marginLeft: 4 * unit,
              padding: `${9 * unit}px ${18 * unit}px`,
              maxWidth: '64%',
              background: chrome.shell,
              borderTop: `1px solid ${chrome.border}`,
              borderLeft: `1px solid ${chrome.border}`,
              borderRight: `1px solid ${chrome.border}`,
              borderTopLeftRadius: 10 * unit,
              borderTopRightRadius: 10 * unit,
            }}
          >
            {/* The mark is a bare path; this wrapper stays transparent so no white notch appears. */}
            <span style={{ flexShrink: 0, display: 'flex', background: 'transparent', border: 'none', padding: 0 }}>
              <CodeLogo language={block.language} size={19 * unit} tone={chrome.dark ? 'dark' : 'light'} />
            </span>
            {/* While editing the tab label is a textbox; the exported slide gets plain markup. */}
            {interactive ? (
              <EditableText
                value={filename}
                editable
                dir="ltr"
                onChange={rename}
                placeholder={`${LANGUAGE_LABELS[block.language]} file`}
                style={titleStyle}
              />
            ) : (
              <span style={titleStyle}>{filename || `${LANGUAGE_LABELS[block.language]} file`}</span>
            )}
            <span
              style={{
                flexShrink: 0,
                fontFamily: codeFont,
                fontSize: 15 * unit,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: `${4 * unit}px ${9 * unit}px`,
                borderRadius: 999,
                background: withAlpha(palette.plain, 0.14),
                color: palette.comment,
              }}
            >
              {LANGUAGE_LABELS[block.language]}
            </span>
          </div>
        )}
      </div>

      <div dir="ltr" style={{ ...isolation, display: 'flex', alignItems: 'stretch' }}>
        {showNumbers && (
          <div
            aria-hidden
            style={{
              ...isolation,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              flexShrink: 0,
              padding: `${bodyPadding}px ${14 * unit}px`,
              background: chrome.gutterBg,
              borderRight: `1px solid ${chrome.border}`,
              fontSize,
              lineHeight: CODE_LINE_HEIGHT,
              color: chrome.gutter,
              userSelect: 'none',
            }}
          >
            {lineNumbers.map((_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
        )}

        <div dir="ltr" style={{ ...isolation, flex: 1, minWidth: 0, padding: `${bodyPadding}px ${24 * unit}px` }}>
          {rows.map((row, index) => (
            <div key={index} style={lineStyle}>
              <TokenRun tokens={row} palette={palette} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface BlockRendererProps {
  block: Block
  tokens: ThemeTokens
  unit: number
  variant: Variant
  centered: boolean
  /** Reading direction of the slide. Code blocks ignore it on purpose. */
  direction?: TextDirection
  interactive?: boolean
  selected?: boolean
  onSelect?: () => void
  onPatch?: (patch: Record<string, unknown>) => void
}

export function BlockRenderer({
  block,
  tokens,
  unit,
  variant,
  centered,
  direction = 'ltr',
  interactive = false,
  selected = false,
  onSelect,
  onPatch,
}: BlockRendererProps) {
  const isRtl = direction === 'rtl'
  // Persian glyphs (گ چ پ ژ گ) reach well above and below the baseline, so the
  // display sizes get extra leading or the ascenders start touching the line above.
  const headingLineHeight = isRtl ? 1.3 : 1.08
  const ctaLineHeight = isRtl ? 1.32 : 1.1
  // An explicit block.align is a user choice; the default follows the reading edge.
  const startAlign: CSSProperties['textAlign'] = centered ? 'center' : isRtl ? 'right' : 'left'

  const selectionRing = selected ? '0 0 0 3px rgba(109, 90, 230, 0.85), 0 0 0 7px rgba(109, 90, 230, 0.25)' : undefined

  const wrapper = (children: React.ReactNode, extra?: CSSProperties) => (
    <div
      className={cn('w-full', interactive && 'cursor-pointer transition-shadow rounded-[10px]')}
      style={{ boxShadow: selectionRing, ...extra }}
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation()
              onSelect?.()
            }
          : undefined
      }
    >
      {children}
    </div>
  )

  switch (block.type) {
    case 'heading': {
      const size = TYPE_SCALE[variant] * unit
      return wrapper(
        <EditableText
          value={block.text}
          editable={interactive}
          onChange={(text) => onPatch?.({ text })}
          placeholder="Headline"
          style={{
            fontFamily: tokens.fontHeading,
            fontWeight: tokens.headingWeight,
            fontSize: size,
            lineHeight: headingLineHeight,
            letterSpacing: tokens.headingTracking,
            textTransform: tokens.headingCase,
            color: tokens.text,
            textAlign: block.align ?? startAlign,
          }}
        />,
      )
    }

    case 'paragraph': {
      const size = TYPE_SCALE[variant] * unit * (variant === 'subtitle' ? 0.98 : 1)
      return wrapper(
        <EditableText
          value={block.text}
          editable={interactive}
          multiline
          onChange={(text) => onPatch?.({ text })}
          placeholder="Supporting copy"
          style={{
            fontFamily: tokens.fontBody,
            fontWeight: tokens.bodyWeight,
            fontSize: size,
            lineHeight: variant === 'subtitle' ? 1.45 : 1.55,
            color: variant === 'subtitle' ? withAlpha(tokens.text, 0.82) : withAlpha(tokens.text, 0.9),
            textAlign: block.align ?? startAlign,
            whiteSpace: 'pre-wrap',
          }}
        />,
      )
    }

    case 'quote': {
      return wrapper(
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * unit }}>
          <span
            aria-hidden
            style={{
              fontFamily: tokens.fontHeading,
              fontSize: 118 * unit,
              lineHeight: 0.7,
              color: tokens.accent,
              opacity: 0.9,
            }}
          >
            &ldquo;
          </span>
          <EditableText
            value={block.text}
            editable={interactive}
            multiline
            onChange={(text) => onPatch?.({ text })}
            placeholder="Pull quote"
            style={{
              fontFamily: tokens.fontHeading,
              fontWeight: tokens.headingWeight === 400 ? 400 : 500,
              fontSize: 42 * unit,
              lineHeight: 1.32,
              letterSpacing: '0em',
              color: tokens.text,
            }}
          />
          <EditableText
            value={block.attribution ?? ''}
            editable={interactive}
            onChange={(attribution) => onPatch?.({ attribution })}
            placeholder="Attribution"
            style={{
              fontFamily: tokens.fontBody,
              fontSize: 24 * unit,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: tokens.muted,
            }}
          />
        </div>,
      )
    }

    case 'list': {
      const items = block.items
      const patchItem = (index: number, text: string) => {
        const next = [...items]
        next[index] = text
        onPatch?.({ items: next })
      }
      return wrapper(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 * unit, width: '100%' }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 * unit }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 44 * unit,
                  height: 44 * unit,
                  borderRadius: block.ordered ? Math.max(6, parseInt(tokens.radius, 10) / 2) : 999,
                  background: block.ordered ? tokens.accent : withAlpha(tokens.accent, 0.18),
                  color: block.ordered ? tokens.accentText : tokens.accent,
                  fontFamily: tokens.fontHeading,
                  fontWeight: 700,
                  fontSize: 22 * unit,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 4 * unit,
                  // Flex already flips in RTL; the logical margin keeps the marker off the text.
                  marginInlineEnd: isRtl ? 12 * unit : undefined,
                }}
              >
                {/* Persian decks number their lists with Arabic-Indic digits. */}
                {block.ordered ? (isRtl ? toPersianDigits(index + 1) : index + 1) : '•'}
              </span>
              <EditableText
                value={item}
                editable={interactive}
                multiline
                onChange={(text) => patchItem(index, text)}
                placeholder="Point"
                style={{
                  fontFamily: tokens.fontBody,
                  fontWeight: tokens.bodyWeight,
                  fontSize: 31 * unit,
                  lineHeight: 1.42,
                  color: withAlpha(tokens.text, 0.92),
                  flex: 1,
                }}
              />
            </div>
          ))}
        </div>,
      )
    }

    case 'image': {
      const height = 320 * unit
      const base: CSSProperties = {
        width: '100%',
        height,
        borderRadius: tokens.radius,
        border: `1px solid ${tokens.border}`,
        overflow: 'hidden',
        background: tokens.surface,
      }
      if (!block.src) {
        return wrapper(
          <div
            style={{
              ...base,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12 * unit,
              border: `2px dashed ${withAlpha(tokens.border, 1)}`,
              color: tokens.muted,
            }}
          >
            <ImageIcon size={40 * unit} />
            <span style={{ fontSize: 22 * unit, fontFamily: tokens.fontBody }}>
              {interactive ? 'Add an image from the panel' : 'Image'}
            </span>
          </div>,
        )
      }
      return wrapper(
        <img
          src={block.src}
          alt={block.alt ?? ''}
          style={{ ...base, objectFit: block.fit ?? 'cover', display: 'block' }}
        />,
      )
    }

    case 'icon': {
      const Icon = getIcon(block.icon)
      return wrapper(
        <div
          style={{
            display: 'flex',
            flexDirection: centered ? 'column' : 'row',
            alignItems: 'center',
            gap: 16 * unit,
            justifyContent: centered ? 'center' : 'flex-start',
          }}
        >
          <span
            style={{
              width: 92 * unit,
              height: 92 * unit,
              borderRadius: tokens.radius === '0px' ? 0 : Math.min(28, parseInt(tokens.radius, 10) + 8),
              background: withAlpha(tokens.accent, 0.16),
              color: tokens.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={46 * unit} strokeWidth={2.2} />
          </span>
          {block.label && (
            <span
              style={{
                fontFamily: tokens.fontBody,
                fontSize: 22 * unit,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: tokens.muted,
              }}
            >
              {block.label}
            </span>
          )}
        </div>,
      )
    }

    case 'statistic': {
      return wrapper(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 14 * unit }}>
          <span
            style={{
              fontFamily: tokens.fontHeading,
              fontWeight: tokens.headingWeight,
              fontSize: 118 * unit,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: tokens.accent,
            }}
          >
            {block.value}
          </span>
          <span
            style={{
              fontFamily: tokens.fontBody,
              fontWeight: 600,
              fontSize: 34 * unit,
              lineHeight: 1.3,
              color: tokens.text,
              maxWidth: 720 * unit,
            }}
          >
            {block.label}
          </span>
          {block.caption && (
            <span style={{ fontFamily: tokens.fontBody, fontSize: 24 * unit, color: tokens.muted }}>{block.caption}</span>
          )}
        </div>,
      )
    }

    case 'comparison': {
      const card: CSSProperties = {
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radius,
        padding: 28 * unit,
        boxShadow: tokens.shadow,
        display: 'flex',
        flexDirection: 'column',
        gap: 16 * unit,
        minHeight: 0,
      }
      const columns: { label: string; items: string[]; highlight: boolean }[] = [
        { label: block.leftLabel, items: block.leftItems, highlight: false },
        { label: block.rightLabel, items: block.rightItems, highlight: true },
      ]
      return wrapper(
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 * unit, width: '100%' }}>
          {columns.map((column) => (
            <div key={column.label} style={card}>
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: tokens.fontBody,
                  fontSize: 20 * unit,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: `${8 * unit}px ${14 * unit}px`,
                  borderRadius: 999,
                  background: column.highlight ? tokens.accent : withAlpha(tokens.text, 0.08),
                  color: column.highlight ? tokens.accentText : tokens.muted,
                }}
              >
                {column.label}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * unit }}>
                {column.items.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 12 * unit, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        marginTop: 12 * unit,
                        width: 8 * unit,
                        height: 8 * unit,
                        borderRadius: 999,
                        flexShrink: 0,
                        background: column.highlight ? tokens.accent : tokens.muted,
                        opacity: column.highlight ? 1 : 0.6,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: tokens.fontBody,
                        fontSize: 26 * unit,
                        lineHeight: 1.4,
                        color: column.highlight ? tokens.text : withAlpha(tokens.text, 0.78),
                        textDecoration: column.highlight ? 'none' : 'none',
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>,
      )
    }

    case 'callout': {
      const Icon = TONE_ICONS[block.tone] ?? Info
      return wrapper(
        <div
          style={{
            display: 'flex',
            gap: 20 * unit,
            alignItems: 'flex-start',
            background: tokens.surface,
            border: `1px solid ${tokens.border}`,
            // Logical border: the accent stripe sits on the reading edge in both directions.
            borderInlineStart: `${6 * unit}px solid ${tokens.accent}`,
            borderRadius: tokens.radius,
            boxShadow: tokens.shadow,
            padding: 32 * unit,
            width: '100%',
          }}
        >
          <Icon size={34 * unit} color={tokens.accent} style={{ flexShrink: 0, marginTop: 4 * unit }} />
          <EditableText
            value={block.text}
            editable={interactive}
            multiline
            onChange={(text) => onPatch?.({ text })}
            placeholder="The idea worth highlighting"
            style={{
              fontFamily: tokens.fontBody,
              fontWeight: 500,
              fontSize: 30 * unit,
              lineHeight: 1.45,
              color: tokens.text,
            }}
          />
        </div>,
      )
    }

    case 'cta': {
      return wrapper(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * unit, alignItems: centered ? 'center' : 'flex-start' }}>
          <span
            aria-hidden
            style={{ width: 88 * unit, height: 6 * unit, borderRadius: 999, background: tokens.accent }}
          />
          <EditableText
            value={block.text}
            editable={interactive}
            multiline
            onChange={(text) => onPatch?.({ text })}
            placeholder="Ask for the next step"
            style={{
              fontFamily: tokens.fontHeading,
              fontWeight: tokens.headingWeight,
              fontSize: 62 * unit,
              lineHeight: ctaLineHeight,
              letterSpacing: tokens.headingTracking,
              textTransform: tokens.headingCase,
              color: tokens.text,
              textAlign: startAlign,
            }}
          />
          <EditableText
            value={block.subtext ?? ''}
            editable={interactive}
            multiline
            onChange={(subtext) => onPatch?.({ subtext })}
            placeholder="Short supporting line"
            style={{
              fontFamily: tokens.fontBody,
              fontSize: 28 * unit,
              lineHeight: 1.5,
              color: withAlpha(tokens.text, 0.82),
              textAlign: startAlign,
            }}
          />
        </div>,
      )
    }

    case 'code':
      // Belt and braces: the wrapper itself is pinned LTR too, not just the window inside it.
      return wrapper(
        <CodeWindow block={block} tokens={tokens} unit={unit} interactive={interactive} onPatch={onPatch} />,
        { direction: 'ltr' },
      )

    default:
      return null
  }
}
