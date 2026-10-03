import { Check, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Input, Label, SectionTitle, Select, Slider, Toggle } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import { useToast } from '../../components/ui/Toast'
import { loadBrandKit, saveBrandKit } from '../../lib/brand'
import { PLATFORMS } from '../../lib/platforms'
import {
  BG_STYLE_OPTIONS,
  CODE_FONT_OPTIONS,
  FONT_OPTIONS,
  FONT_VAZIRMATN,
  getTheme,
  isRtlStarterTheme,
  RADIUS_OPTIONS,
  resolveCodeFont,
  supportsPersian,
  THEMES,
} from '../../lib/themes'
import type { AuthorProfile, BrandKit, PlatformId, Project, SocialKey, TextDirection } from '../../lib/types'
import { cn, readFileAsDataUrl } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { ThemeSwatch } from '../themes/ThemeSwatch'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string
  value?: string
  fallback: string
  onChange: (value: string) => void
}) {
  const current = value ?? fallback
  const safe = HEX.test(current) ? current : HEX.test(fallback) ? fallback : '#000000'
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-9 shrink-0 cursor-pointer rounded-md border border-line bg-app p-0.5"
          aria-label={label}
        />
        <Input value={current} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  )
}

export function DesignPanel({ project }: { project: Project }) {
  const setTheme = useAppStore((state) => state.setTheme)
  const setOverrides = useAppStore((state) => state.setOverrides)
  const resetOverrides = useAppStore((state) => state.resetOverrides)
  const setDesign = useAppStore((state) => state.setDesign)
  const setPlatform = useAppStore((state) => state.setPlatform)
  const setLogo = useAppStore((state) => state.setLogo)
  const { toast } = useToast()

  const logoInput = useRef<HTMLInputElement>(null)
  const brandLogoInput = useRef<HTMLInputElement>(null)
  const theme = getTheme(project.design.themeId)
  const tokens = theme.tokens
  const overrides = project.design.overrides
  const overrideCount = Object.keys(overrides).length

  const [brandKit, setBrandKit] = useState<BrandKit>(
    () => loadBrandKit() ?? { name: '', color: tokens.accent, font: tokens.fontHeading },
  )

  const author = project.design.author ?? { name: '' }
  const authorInputRef = useRef<HTMLInputElement>(null)
  const labInputRef = useRef<HTMLInputElement>(null)
  const patchAuthor = (patch: Partial<AuthorProfile>) => setDesign({ author: { ...author, ...patch } })
  const patchSocial = (key: SocialKey, value: string) =>
    // Blanking a field removes it, so the outro card never shows an empty badge.
    patchAuthor({ socials: { ...author.socials, [key]: value.trim() || undefined } })

  /**
   * Switching to RTL only makes sense with a font that actually has Persian
   * glyphs, so a Latin-only heading or body face is upgraded to Vazirmatn.
   */
  const changeDirection = (direction: TextDirection) => {
    if (direction === project.design.direction) return

    const current = {
      heading: overrides.fontHeading ?? tokens.fontHeading,
      body: overrides.fontBody ?? tokens.fontBody,
    }
    const needsPersianFont = !supportsPersian(current.heading) || !supportsPersian(current.body)

    setDesign(
      needsPersianFont && direction === 'rtl'
        ? { direction, overrides: { ...overrides, fontHeading: FONT_VAZIRMATN, fontBody: FONT_VAZIRMATN } }
        : { direction },
    )
    if (needsPersianFont && direction === 'rtl') {
      toast('Switched to Vazirmatn so Persian text renders correctly', 'success')
    }
  }

  const uploadLogo = async (file: File | undefined, target: 'project' | 'brand') => {
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (target === 'project') {
        setLogo(dataUrl)
        setDesign({ showLogo: true })
      } else {
        setBrandKit((kit) => ({ ...kit, logoUrl: dataUrl }))
      }
    } catch {
      toast('Could not read that image', 'error')
    }
  }

  /** Avatar and lab emblem are stashed as base64 inside the design record. */
  const uploadAuthorImage = async (file: File | undefined, target: 'avatar' | 'lab') => {
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (target === 'avatar') {
        setDesign({ author: { ...author, avatarUrl: dataUrl } })
      } else {
        setDesign({ labLogoUrl: dataUrl, showLabBadge: true })
      }
    } catch {
      toast('Could not read that image', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle hint={theme.name}>Theme</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.tagline}
              onClick={() => {
                setTheme(item.id)
                if (isRtlStarterTheme(item.id)) changeDirection('rtl')
              }}
              className={cn(
                'relative rounded-xl border p-1 transition-all',
                item.id === project.design.themeId
                  ? 'border-brand ring-2 ring-brand/25'
                  : 'border-line hover:border-line-strong',
              )}
            >
              <ThemeSwatch theme={item} />
              <span className="mt-1 block truncate text-center text-[10px] text-ink-soft">{item.name}</span>
              {item.id === project.design.themeId && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                  <Check size={11} />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          hint={overrideCount > 0 ? `${overrideCount} override${overrideCount === 1 ? '' : 's'}` : undefined}
          action={
            overrideCount > 0 ? (
              <button
                type="button"
                onClick={resetOverrides}
                className="inline-flex items-center gap-1 text-[11px] text-ink-soft transition-colors hover:text-ink"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            ) : undefined
          }
        >
          Customize
        </SectionTitle>
        <div className="space-y-3">
          <ColorField
            label="Accent"
            value={overrides.accent}
            fallback={tokens.accent}
            onChange={(accent) => setOverrides({ accent })}
          />
          <ColorField
            label="Background"
            value={overrides.bg}
            fallback={tokens.bg}
            onChange={(bg) => setOverrides({ bg })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Heading font</Label>
              <Select
                value={overrides.fontHeading ?? tokens.fontHeading}
                onChange={(event) => setOverrides({ fontHeading: event.target.value })}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Body font</Label>
              <Select
                value={overrides.fontBody ?? tokens.fontBody}
                onChange={(event) => setOverrides({ fontBody: event.target.value })}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label hint="Code & terminal blocks only">Code font</Label>
            <Select
              value={resolveCodeFont({ ...tokens, ...overrides })}
              onChange={(event) => setOverrides({ fontCode: event.target.value })}
            >
              {CODE_FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Corners</Label>
              <Select
                value={overrides.radius ?? tokens.radius}
                onChange={(event) => setOverrides({ radius: event.target.value })}
              >
                {RADIUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Background</Label>
              <Select
                value={overrides.background ?? tokens.background}
                onChange={(event) =>
                  setOverrides({ background: event.target.value as (typeof BG_STYLE_OPTIONS)[number]['value'] })
                }
              >
                {BG_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Slide padding</Label>
            <Slider
              min={56}
              max={128}
              step={2}
              value={overrides.padding ?? tokens.padding}
              onChange={(padding) => setOverrides({ padding })}
              suffix="px"
            />
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Display</SectionTitle>
        <div className="space-y-2.5">
          <div>
            <Label hint="Code blocks always stay left-to-right">Text direction</Label>
            <Segmented
              full
              size="sm"
              value={project.design.direction ?? 'ltr'}
              onChange={changeDirection}
              options={[
                { value: 'ltr', label: 'LTR (English)' },
                { value: 'rtl', label: 'RTL (فارسی)' },
              ]}
            />
          </div>
          <Input
            value={project.design.kicker}
            placeholder="Kicker label (e.g. BUILDING IN PUBLIC)"
            onChange={(event) => setDesign({ kicker: event.target.value })}
          />
          <Toggle
            checked={project.design.showSlideNumbers}
            onChange={(showSlideNumbers) => setDesign({ showSlideNumbers })}
            label="Slide numbers & progress"
          />
          <Toggle
            checked={project.design.showLogo}
            onChange={(showLogo) => setDesign({ showLogo })}
            label="Show logo on slides"
            description="Uses the logo uploaded below"
          />
          <div className="flex items-center gap-2">
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => uploadLogo(event.target.files?.[0], 'project')}
            />
            <Button size="sm" className="flex-1" onClick={() => logoInput.current?.click()}>
              <Upload size={13} />
              {project.logoUrl ? 'Replace logo' : 'Upload logo'}
            </Button>
            {project.logoUrl && (
              <Button size="sm" variant="ghost" onClick={() => setLogo(undefined)}>
                Clear
              </Button>
            )}
          </div>
          {project.logoUrl && (
            <div className="flex h-14 items-center justify-center rounded-lg border border-line bg-app p-2">
              <img src={project.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Platform</SectionTitle>
        <Select
          value={project.design.platformId}
          onChange={(event) => setPlatform(event.target.value as PlatformId)}
        >
          {PLATFORMS.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.label} · {platform.width}×{platform.height}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-[11px] text-ink-soft">
          Presets are abstract — new networks can be added without touching the editor.
        </p>
      </section>

      <section>
        <SectionTitle hint="Cover & closing slide">Author & Lab</SectionTitle>
        <div className="space-y-3">
          <Toggle
            checked={Boolean(project.design.showAuthor)}
            onChange={(showAuthor) => setDesign({ showAuthor })}
            label="Show author profile"
            description="A byline on the cover, a full card on the closing slide"
          />
          {project.design.showAuthor && (
            <>
              <Input
                value={author.name}
                placeholder="Author name"
                onChange={(event) => patchAuthor({ name: event.target.value })}
              />
              <Input
                value={author.role ?? ''}
                placeholder="Role (e.g. Senior Software Engineer)"
                onChange={(event) => patchAuthor({ role: event.target.value })}
              />
              <Input
                value={author.handle ?? ''}
                placeholder="Handle (e.g. @username)"
                onChange={(event) => patchAuthor({ handle: event.target.value })}
              />
              <div className="flex items-center gap-2">
                {author.avatarUrl ? (
                  <img
                    src={author.avatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-[11px] text-ink-soft">
                    ?
                  </span>
                )}
                <input
                  ref={authorInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadAuthorImage(event.target.files?.[0], 'avatar')}
                />
                <Button size="sm" className="flex-1" onClick={() => authorInputRef.current?.click()}>
                  <Upload size={13} />
                  {author.avatarUrl ? 'Replace avatar' : 'Upload avatar'}
                </Button>
                {author.avatarUrl && (
                  <Button size="sm" variant="ghost" onClick={() => patchAuthor({ avatarUrl: undefined })}>
                    Clear
                  </Button>
                )}
              </div>

              <div className="border-t border-line pt-3">
                <Label>Social channels</Label>
                <p className="mb-2 text-[11px] text-ink-soft">
                  Only the ones you fill in show up on the closing card.
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ['linkedin', 'LinkedIn', 'in/username'],
                      ['github', 'GitHub', 'github.com/username'],
                      ['telegram', 'Telegram', 't.me/username'],
                      ['twitter', 'X / Twitter', '@username'],
                      ['instagram', 'Instagram', '@username'],
                      ['website', 'Website', 'mywebsite.ir'],
                      ['email', 'Email', 'author@example.com'],
                    ] as [SocialKey, string, string][]
                  ).map(([key, label, placeholder]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[11px] text-ink-soft">{label}</span>
                      <Input
                        value={author.socials?.[key] ?? ''}
                        placeholder={placeholder}
                        onChange={(event) => patchSocial(key, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-line pt-3">
            <Toggle
              checked={Boolean(project.design.showLabBadge)}
              onChange={(showLabBadge) => setDesign({ showLabBadge })}
              label="Show lab badge"
              description="A circular emblem in the slide header"
            />
          </div>
          <div className="border-t border-line pt-3">
            <Toggle
              checked={Boolean(project.design.showOutroSlide)}
              onChange={(showOutroSlide) => setDesign({ showOutroSlide })}
              label="Outro card on last slide"
              description="Contact card with avatar, CTA and social channels"
            />
            {project.design.showOutroSlide && (
              <div className="mt-3 space-y-2">
                <Label>Outro call to action</Label>
                <textarea
                  value={project.design.outroCtaText ?? ''}
                  rows={2}
                  placeholder={
                    project.design.direction === 'rtl'
                      ? 'اگر این پست مفید بود، ذخیره‌اش کن و با دوستانت به اشتراک بذار'
                      : 'Found this useful? Save it and share it with a friend'
                  }
                  onChange={(event) => setDesign({ outroCtaText: event.target.value })}
                  className={cn(
                    'w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent',
                  )}
                />
                <p className="text-[11px] text-ink-soft">Leave empty to use the default line for the slide language.</p>
              </div>
            )}
          </div>

          {project.design.showLabBadge && (
            <div className="flex items-center gap-2">
              {project.design.labLogoUrl ? (
                <img
                  src={project.design.labLogoUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface object-contain p-1"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-[11px] text-ink-soft">
                  ?
                </span>
              )}
              <input
                ref={labInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => uploadAuthorImage(event.target.files?.[0], 'lab')}
              />
              <Button size="sm" className="flex-1" onClick={() => labInputRef.current?.click()}>
                <Upload size={13} />
                {project.design.labLogoUrl ? 'Replace emblem' : 'Upload lab emblem'}
              </Button>
              {project.design.labLogoUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDesign({ labLogoUrl: undefined, showLabBadge: false })}
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Brand kit</SectionTitle>
        <div className="space-y-3">
          <Input
            value={brandKit.name}
            placeholder="Brand or profile name"
            onChange={(event) => setBrandKit((kit) => ({ ...kit, name: event.target.value }))}
          />
          <ColorField
            label="Brand color"
            value={brandKit.color}
            fallback={tokens.accent}
            onChange={(color) => setBrandKit((kit) => ({ ...kit, color }))}
          />
          <div>
            <Label>Brand font</Label>
            <Select
              value={brandKit.font}
              onChange={(event) => setBrandKit((kit) => ({ ...kit, font: event.target.value }))}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </Select>
          </div>
          <input
            ref={brandLogoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => uploadLogo(event.target.files?.[0], 'brand')}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => brandLogoInput.current?.click()}>
              <Upload size={13} />
              {brandKit.logoUrl ? 'Replace brand logo' : 'Add brand logo'}
            </Button>
            {brandKit.logoUrl && (
              <Button size="sm" variant="ghost" onClick={() => setBrandKit((kit) => ({ ...kit, logoUrl: undefined }))}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                saveBrandKit(brandKit)
                toast('Brand kit saved in this browser', 'success')
              }}
            >
              Save brand kit
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              onClick={() => {
                setOverrides({
                  accent: brandKit.color,
                  fontHeading: brandKit.font,
                  fontBody: brandKit.font,
                })
                if (brandKit.logoUrl) {
                  setLogo(brandKit.logoUrl)
                  setDesign({ showLogo: true })
                }
                if (brandKit.name.trim()) setDesign({ kicker: brandKit.name.trim().toUpperCase() })
                toast('Brand kit applied to this carousel', 'success')
              }}
            >
              Apply
            </Button>
          </div>
          {brandKit.logoUrl && (
            <div className="flex h-14 items-center justify-center rounded-lg border border-line bg-app p-2">
              <img src={brandKit.logoUrl} alt="Brand logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-ink-soft">
            Applying a brand kit updates colors, fonts and logo across every slide while keeping your content
            untouched.
          </p>
        </div>
      </section>
    </div>
  )
}
