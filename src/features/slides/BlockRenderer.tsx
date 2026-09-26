import { AlertTriangle, CheckCircle2, Image as ImageIcon, Info } from 'lucide-react'
import type { CSSProperties } from 'react'

import { getIcon } from '../../lib/icons'
import { withAlpha } from '../../lib/themes'
import type { Block, ThemeTokens } from '../../lib/types'
import { cn } from '../../lib/utils'
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

export interface BlockRendererProps {
  block: Block
  tokens: ThemeTokens
  unit: number
  variant: Variant
  centered: boolean
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
  interactive = false,
  selected = false,
  onSelect,
  onPatch,
}: BlockRendererProps) {
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
            lineHeight: 1.08,
            letterSpacing: tokens.headingTracking,
            textTransform: tokens.headingCase,
            color: tokens.text,
            textAlign: block.align ?? (centered ? 'center' : 'left'),
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
            textAlign: block.align ?? (centered ? 'center' : 'left'),
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
                }}
              >
                {block.ordered ? index + 1 : '•'}
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
            borderLeft: `${6 * unit}px solid ${tokens.accent}`,
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
              lineHeight: 1.1,
              letterSpacing: tokens.headingTracking,
              textTransform: tokens.headingCase,
              color: tokens.text,
              textAlign: centered ? 'center' : 'left',
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
              textAlign: centered ? 'center' : 'left',
            }}
          />
        </div>,
      )
    }

    default:
      return null
  }
}
