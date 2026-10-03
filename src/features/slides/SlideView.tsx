import type { CSSProperties } from 'react'

import { SocialIcon } from '../../lib/codeLogos'
import { isDarkColor } from '../../lib/highlight'
import { getLayout } from '../../lib/layouts'
import { getPlatform } from '../../lib/platforms'
import { resolveTheme, slideBackground, withAlpha } from '../../lib/themes'
import type { AuthorProfile, Block, LayoutId, Project, Slide, SocialKey, ThemeTokens } from '../../lib/types'
import { toPersianDigits } from '../../lib/utils'
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

/** True when the card background is dark enough to need light brand ink. */
function isDarkSlide(tokens: ThemeTokens): boolean {
  return isDarkColor(tokens.surface)
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

/** Circular avatar; falls back to initials when no image was uploaded. */
function AuthorAvatar({
  author,
  size,
  tokens,
  unit,
}: {
  author: AuthorProfile
  size: number
  tokens: ThemeTokens
  unit: number
}) {
  const frame: CSSProperties = {
    width: size,
    height: size,
    borderRadius: 999,
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: withAlpha(tokens.accent, 0.16),
    color: tokens.accent,
    border: `${2 * unit}px solid ${withAlpha(tokens.accent, 0.35)}`,
    fontFamily: tokens.fontHeading,
    fontWeight: 700,
    fontSize: size * 0.38,
  }

  return author.avatarUrl ? (
    <img src={author.avatarUrl} alt="" style={{ ...frame, objectFit: 'cover' }} />
  ) : (
    <span style={frame}>{initials(author.name) || '—'}</span>
  )
}

/**
 * The circular lab emblem in the slide header.
 *
 * Cropped with `object-fit: cover` rather than `contain` so it matches the
 * author's avatar: a non-square source fills the circle edge-to-edge and is
 * clipped by the parent, instead of floating as a small rectangle inside it.
 */
function LabBadge({ src, size, tokens, unit }: { src: string; size: number; tokens: ThemeTokens; unit: number }) {
  return (
    <div
      style={{
        marginInlineStart: 'auto',
        width: size,
        height: size,
        borderRadius: 9999,
        overflow: 'hidden',
        border: `${2 * unit}px solid ${tokens.accent}`,
        background: tokens.surface,
        boxShadow: tokens.shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
    </div>
  )
}

/** Ordered so the grid reads the way people scan a contact card. */
const SOCIAL_ORDER: { key: SocialKey; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'twitter', label: 'X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'website', label: 'Website' },
  { key: 'email', label: 'Email' },
]

const OUTRO_CTA = {
  rtl: 'اگر این پست مفید بود، ذخیره‌اش کن و با دوستانت به اشتراک بذار',
  ltr: 'Found this useful? Save it and share it with a friend',
}

function activeSocials(author: AuthorProfile): { key: SocialKey; label: string; value: string }[] {
  const socials = author.socials
  if (!socials) return []
  return SOCIAL_ORDER.flatMap(({ key, label }) => {
    const value = socials[key]?.trim()
    return value ? [{ key, label, value }] : []
  })
}

/**
 * The closing contact card: avatar, lab emblem, name, a call to action and the
 * social grid. Only the fields the author actually filled in are rendered, so an
 * empty profile never leaves dangling placeholders on the last slide.
 */
function OutroCard({
  author,
  tokens,
  unit,
  ctaText,
  isRtl,
  labLogoUrl,
}: {
  author: AuthorProfile
  tokens: ThemeTokens
  unit: number
  ctaText?: string
  isRtl: boolean
  labLogoUrl?: string
}) {
  const socials = activeSocials(author)
  const cta = ctaText?.trim() || (isRtl ? OUTRO_CTA.rtl : OUTRO_CTA.ltr)
  // `surface` sits on the slide background; the grid sits on the card, so it
  // needs the card's own background to decide light-on-dark.
  const onDark = isDarkSlide(tokens)

  return (
    <div
      style={{
        marginTop: 28 * unit,
        padding: `${28 * unit}px ${30 * unit}px`,
        borderRadius: tokens.radius,
        border: `1px solid ${tokens.border}`,
        background: tokens.surface,
        boxShadow: tokens.shadow,
        display: 'flex',
        flexDirection: 'column',
        gap: 22 * unit,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 * unit }}>
        <AuthorAvatar author={author} size={96 * unit} tokens={tokens} unit={unit} />
        {labLogoUrl && (
          <LabBadge src={labLogoUrl} size={62 * unit} tokens={tokens} unit={unit} />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4 * unit,
            minWidth: 0,
            flex: 1,
            textAlign: isRtl ? 'right' : 'left',
            alignItems: isRtl ? 'flex-end' : 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: tokens.fontHeading,
              fontWeight: tokens.headingWeight === 400 ? 600 : tokens.headingWeight,
              fontSize: 36 * unit,
              lineHeight: 1.2,
              color: tokens.text,
            }}
          >
            {author.name}
          </span>
          {author.role && (
            <span
              style={{
                fontFamily: tokens.fontBody,
                fontSize: 22 * unit,
                lineHeight: 1.35,
                color: withAlpha(tokens.text, 0.78),
              }}
            >
              {author.role}
            </span>
          )}
          {author.handle && (
            <span
              style={{
                fontFamily: tokens.fontBody,
                fontSize: 18 * unit,
                fontWeight: 600,
                padding: `${4 * unit}px ${10 * unit}px`,
                borderRadius: 999,
                background: withAlpha(tokens.accent, 0.14),
                color: tokens.accent,
              }}
            >
              {author.handle}
            </span>
          )}
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontFamily: tokens.fontBody,
          fontSize: 24 * unit,
          lineHeight: 1.5,
          color: tokens.text,
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {cta}
      </p>

      {socials.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10 * unit,
            // Badges follow the reading edge, so RTL fills from the right.
            justifyContent: isRtl ? 'flex-end' : 'flex-start',
          }}
        >
          {socials.map((social) => (
            <span
              key={social.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8 * unit,
                maxWidth: '100%',
                padding: `${8 * unit}px ${14 * unit}px`,
                borderRadius: 999,
                border: `1px solid ${tokens.border}`,
                background: tokens.bg,
              }}
            >
              <SocialIcon id={social.key} size={20 * unit} onDark={onDark} />
              <span
                style={{
                  fontFamily: tokens.fontBody,
                  fontSize: 19 * unit,
                  fontWeight: 600,
                  color: tokens.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {social.value}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
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
  const direction = project.design.direction ?? 'ltr'
  const isRtl = direction === 'rtl'
  const padding = tokens.padding * unit
  const centered = layout.align === 'center'
  const showLogo = project.design.showLogo && Boolean(project.logoUrl)
  const kicker = project.design.kicker.trim()

  const author = project.design.author
  const isCover = index === 0
  const isClosing = total > 1 && index === total - 1
  // The outro card is the richer version of the closing card, so it implies the author bar.
  const showOutro = Boolean(project.design.showOutroSlide && author?.name.trim()) && isClosing
  const showAuthor = Boolean((project.design.showAuthor || showOutro) && author?.name.trim())
  const labLogoUrl = project.design.labLogoUrl
  const showLabBadge = Boolean(project.design.showLabBadge && labLogoUrl)
  const counter = isRtl
    ? `${toPersianDigits(pad(index + 1))} / ${toPersianDigits(pad(total))}`
    : `${pad(index + 1)} / ${pad(total)}`

  return (
    <div
      dir={direction}
      style={{
        width: platform.width,
        height: platform.height,
        ...slideBackground(tokens),
        color: tokens.text,
        fontFamily: tokens.fontBody,
        // The whole slide is one reading direction; blocks that must stay LTR opt out explicitly.
        direction,
        padding,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {(showLogo || kicker || showLabBadge) && (
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
          {showLabBadge && labLogoUrl && <LabBadge src={labLogoUrl} size={54 * unit} tokens={tokens} unit={unit} />}
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
            direction={direction}
            interactive={interactive}
            selected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock?.(block.id)}
            onPatch={(patch) => onPatchBlock?.(block.id, patch)}
          />
        ))}
      </div>

      {showOutro && author ? (
        <OutroCard
          author={author}
          tokens={tokens}
          unit={unit}
          ctaText={project.design.outroCtaText}
          isRtl={isRtl}
          labLogoUrl={labLogoUrl}
        />
      ) : (
        <>
          {showAuthor && author && isCover && (
            /* Compact byline so it never competes with the cover headline. */
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 * unit, marginTop: 26 * unit }}>
              <AuthorAvatar author={author} size={54 * unit} tokens={tokens} unit={unit} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * unit, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: tokens.fontHeading,
                    fontWeight: 600,
                    fontSize: 26 * unit,
                    lineHeight: 1.2,
                    color: tokens.text,
                  }}
                >
                  {author.name}
                </span>
                {(author.role || author.handle) && (
                  <span
                    style={{
                      fontFamily: tokens.fontBody,
                      fontSize: 20 * unit,
                      lineHeight: 1.3,
                      color: tokens.muted,
                    }}
                  >
                    {[author.role, author.handle].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {showAuthor && author && isClosing && (
            /* The closing slide gets the full card: this is where people follow. */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22 * unit,
                marginTop: 28 * unit,
                padding: 24 * unit,
                borderRadius: tokens.radius,
                border: `1px solid ${tokens.border}`,
                background: tokens.surface,
                boxShadow: tokens.shadow,
              }}
            >
              <AuthorAvatar author={author} size={84 * unit} tokens={tokens} unit={unit} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * unit, minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontFamily: tokens.fontHeading,
                    fontWeight: tokens.headingWeight === 400 ? 600 : tokens.headingWeight,
                    fontSize: 32 * unit,
                    lineHeight: 1.2,
                    color: tokens.text,
                  }}
                >
                  {author.name}
                </span>
                {author.role && (
                  <span
                    style={{
                      fontFamily: tokens.fontBody,
                      fontSize: 22 * unit,
                      lineHeight: 1.35,
                      color: withAlpha(tokens.text, 0.78),
                    }}
                  >
                    {author.role}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 * unit }}>
                  <span
                    style={{
                      fontFamily: tokens.fontBody,
                      fontSize: 18 * unit,
                      fontWeight: 600,
                      padding: `${4 * unit}px ${10 * unit}px`,
                      borderRadius: 999,
                      background: withAlpha(tokens.accent, 0.14),
                      color: tokens.accent,
                    }}
                  >
                    {author.handle || '@handle'}
                  </span>
                  <span style={{ fontFamily: tokens.fontBody, fontSize: 18 * unit, color: tokens.muted }}>
                    Follow for more on this topic
                  </span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

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
            {/*
              Latin digits and the slash are bidi-neutral, so an RTL paragraph
              would print "01 / 03" reversed; Persian decks use real Persian
              digits and follow the slide direction instead.
            */}
            <span
              dir={direction}
              style={{
                fontFamily: tokens.fontBody,
                fontSize: 21 * unit,
                letterSpacing: '0.14em',
                color: tokens.muted,
                direction,
                unicodeBidi: 'isolate',
              }}
            >
              {counter}
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              // The bar grows from the reading edge, so RTL anchors it to the right.
              left: isRtl ? 'auto' : 0,
              right: isRtl ? 0 : 'auto',
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
