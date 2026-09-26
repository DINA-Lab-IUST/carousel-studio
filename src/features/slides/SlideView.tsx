import { getLayout } from '../../lib/layouts'
import { getPlatform } from '../../lib/platforms'
import { resolveTheme, slideBackground, withAlpha } from '../../lib/themes'
import type { Block, LayoutId, Project, Slide } from '../../lib/types'
import { BlockRenderer, type Variant } from './BlockRenderer'

const LAYOUT_GAPS: Record<LayoutId, number> = {
  cover: 28,
  statement: 18,
  body: 30,
  list: 34,
  quote: 10,
  stat: 22,
  compare: 30,
  callout: 20,
  cta: 26,
}

/** Layout decides the type scale; the block itself stays layout-agnostic. */
export function variantFor(layout: LayoutId, block: Block): Variant {
  if (block.type === 'heading') {
    if (layout === 'cover' || layout === 'statement') return 'display'
    if (layout === 'stat') return 'section'
    if (layout === 'callout') return 'section'
    return 'title'
  }
  if (block.type === 'paragraph') {
    return layout === 'cover' || layout === 'statement' ? 'subtitle' : 'body'
  }
  if (block.type === 'cta') return 'display'
  return 'body'
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export interface SlideViewProps {
  project: Project
  slide: Slide
  index: number
  total: number
  interactive?: boolean
  selectedBlockId?: string | null
  onSelectBlock?: (blockId: string) => void
  onPatchBlock?: (blockId: string, patch: Record<string, unknown>) => void
}

export function SlideView({
  project,
  slide,
  index,
  total,
  interactive = false,
  selectedBlockId,
  onSelectBlock,
  onPatchBlock,
}: SlideViewProps) {
  const platform = getPlatform(project.design.platformId)
  const tokens = resolveTheme(project.design.themeId, project.design.overrides)
  const unit = platform.width / 1080
  const layout = getLayout(slide.layout)
  const padding = tokens.padding * unit
  const centered = layout.align === 'center'
  const showLogo = project.design.showLogo && Boolean(project.logoUrl)
  const kicker = project.design.kicker.trim()

  return (
    <div
      style={{
        width: platform.width,
        height: platform.height,
        ...slideBackground(tokens),
        color: tokens.text,
        fontFamily: tokens.fontBody,
        padding,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {(showLogo || kicker) && (
        <header style={{ display: 'flex', alignItems: 'center', gap: 16 * unit, marginBottom: 10 * unit }}>
          {showLogo && (
            <img
              src={project.logoUrl}
              alt=""
              style={{ height: 48 * unit, width: 'auto', maxWidth: 240 * unit, objectFit: 'contain' }}
            />
          )}
          {kicker &&
            (tokens.kickerStyle === 'chip' ? (
              <span
                style={{
                  fontFamily: tokens.fontBody,
                  fontSize: 21 * unit,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: `${9 * unit}px ${16 * unit}px`,
                  borderRadius: 999,
                  background: withAlpha(tokens.accent, 0.16),
                  color: tokens.accent,
                }}
              >
                {kicker}
              </span>
            ) : tokens.kickerStyle === 'bar' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 * unit }}>
                <span style={{ width: 46 * unit, height: 5 * unit, borderRadius: 999, background: tokens.accent }} />
                <span
                  style={{
                    fontFamily: tokens.fontBody,
                    fontSize: 21 * unit,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: tokens.muted,
                  }}
                >
                  {kicker}
                </span>
              </span>
            ) : (
              <span
                style={{
                  fontFamily: tokens.fontBody,
                  fontSize: 21 * unit,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: tokens.muted,
                }}
              >
                {kicker}
              </span>
            ))}
        </header>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: layout.justify === 'center' ? 'center' : 'flex-start',
          alignItems: centered ? 'center' : 'flex-start',
          gap: LAYOUT_GAPS[slide.layout] * unit,
        }}
      >
        {slide.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            tokens={tokens}
            unit={unit}
            variant={variantFor(slide.layout, block)}
            centered={centered}
            interactive={interactive}
            selected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock?.(block.id)}
            onPatch={(patch) => onPatchBlock?.(block.id, patch)}
          />
        ))}
      </div>

      {project.design.showSlideNumbers && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 18 * unit,
            }}
          >
            <span
              style={{
                fontFamily: tokens.fontBody,
                fontSize: 21 * unit,
                letterSpacing: '0.14em',
                color: tokens.muted,
              }}
            >
              {pad(index + 1)} / {pad(total)}
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: 5 * unit,
              width: `${Math.min(100, ((index + 1) / Math.max(1, total)) * 100)}%`,
              background: tokens.accent,
            }}
          />
        </>
      )}
    </div>
  )
}
