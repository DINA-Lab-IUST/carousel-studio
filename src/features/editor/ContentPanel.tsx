import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Code2,
  Expand,
  Plus,
  Scissors,
  Sparkles,
  SquareTerminal,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'

import { Button } from '../../components/ui/Button'
import { Input, Label, SectionTitle, Select, Textarea, Toggle } from '../../components/ui/Field'
import { Menu } from '../../components/ui/Menu'
import { Segmented } from '../../components/ui/Segmented'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { BLOCK_META, BLOCK_TYPES, getBlockText, withBlockText } from '../../lib/blocks'
import { CODE_LANGUAGES, detectLanguageFromFilename, LANGUAGE_LABELS } from '../../lib/highlight'
import { getIcon, ICON_NAMES } from '../../lib/icons'
import { LAYOUTS } from '../../lib/layouts'
import type { Block, CodeBlockMode, CodeLanguage, Project, Slide } from '../../lib/types'
import { cn, pluralize, readFileAsDataUrl } from '../../lib/utils'
import { ai } from '../../services/ai'
import type { TextTweakMode } from '../../services/ai'
import { useAppStore } from '../../store/store'

type Patch = (patch: Record<string, unknown>) => void

/** Spaces inserted when the user presses Tab inside a snippet. */
const CODE_TAB_SIZE = 2

function AddBlockMenu({ slideId }: { slideId: string }) {
  const addBlock = useAppStore((state) => state.addBlock)

  return (
    <Menu
      align="left"
      className="mt-2.5 w-full"
      trigger={({ toggle }) => (
        <Button variant="secondary" size="sm" className="w-full" onClick={toggle}>
          <Plus size={14} />
          Add block
        </Button>
      )}
      items={BLOCK_TYPES.map((type) => {
        const Icon = BLOCK_META[type].icon
        return {
          label: `${BLOCK_META[type].label} — ${BLOCK_META[type].hint}`,
          icon: <Icon size={14} />,
          onSelect: () => addBlock(slideId, type),
        }
      })}
    />
  )
}

function AiTextActions({ block, apply }: { block: Block; apply: (next: Block) => void }) {
  const { toast } = useToast()
  const [busy, setBusy] = useState<TextTweakMode | null>(null)
  const text = getBlockText(block)

  if (text === undefined) return null

  const run = async (mode: TextTweakMode) => {
    setBusy(mode)
    try {
      const next = await ai.tweakText({ text, mode })
      // withBlockText keeps the result on the field the block actually owns.
      apply(withBlockText(block, next))
      toast(mode === 'shorten' ? 'Text shortened' : mode === 'expand' ? 'Text expanded' : 'Text rewritten', 'success')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-2.5 flex items-center gap-1 border-t border-line pt-2.5">
      <span className="mr-0.5 flex items-center gap-1 text-[11px] text-ink-soft">
        <Sparkles size={12} className="text-brand" />
        AI
      </span>
      {(
        [
          ['rewrite', Wand2],
          ['shorten', Scissors],
          ['expand', Expand],
        ] as const
      ).map(([mode, Icon]) => (
        <Button
          key={mode}
          size="sm"
          variant="ghost"
          className="text-[11px] capitalize"
          disabled={busy !== null}
          onClick={() => run(mode)}
        >
          {busy === mode ? <Spinner size={12} /> : <Icon size={12} />}
          {mode}
        </Button>
      ))}
    </div>
  )
}

function ImageField({ block, patch }: { block: Extract<Block, { type: 'image' }>; patch: Patch }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 4_000_000) {
      toast('Please choose an image under 4 MB', 'error')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      patch({ src: dataUrl, alt: block.alt || file.name.replace(/\.[^.]+$/, '') })
    } catch {
      toast('Could not read that image', 'error')
    }
  }

  return (
    <div className="space-y-2">
      {block.src ? (
        <img src={block.src} alt="" className="h-24 w-full rounded-lg border border-line object-cover" />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-line-strong text-xs text-ink-soft">
          No image yet
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <Button size="sm" className="flex-1" onClick={() => inputRef.current?.click()}>
          <Upload size={13} />
          Upload image
        </Button>
        {block.src && (
          <Button size="sm" variant="ghost" onClick={() => patch({ src: undefined })}>
            Remove
          </Button>
        )}
      </div>
      <Input
        value={block.alt ?? ''}
        placeholder="Alt text"
        onChange={(event) => patch({ alt: event.target.value })}
      />
      <Select value={block.fit ?? 'cover'} onChange={(event) => patch({ fit: event.target.value })}>
        <option value="cover">Fill the frame</option>
        <option value="contain">Fit inside the frame</option>
      </Select>
    </div>
  )
}

function CodeField({
  block,
  patch,
}: {
  block: Extract<Block, { type: 'code' }>
  patch: Patch
}) {
  const terminal = block.mode === 'terminal'

  /**
 * A believable build session, so switching to terminal mode shows something
 * worth looking at instead of an empty box.
 */
const DEFAULT_SESSION = [
  '~/carousel-studio $ pnpm build',
  '',
  'vite v6.4.3 building for production...',
  '✓ 142 modules transformed.',
  '',
  'dist/index.html                  0.84 kB │ gzip:  0.46 kB',
  'dist/assets/app-C1n4x.js       148.20 kB │ gzip: 42.10 kB',
  'dist/assets/app-Bg7y.css        12.63 kB │ gzip:  3.11 kB',
  '',
  '✓ built in 340ms',
].join('\n')

/** Renaming the tab re-detects the language, so `Main.java` just works. */
  const rename = (filename: string) => {
    const detected = detectLanguageFromFilename(filename)
    patch(detected ? { filename, language: detected } : { filename })
  }

  // Tab should indent, not move focus out of the snippet.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    const target = event.currentTarget
    const { selectionStart, selectionEnd } = target
    const indent = ' '.repeat(CODE_TAB_SIZE)
    patch({ code: `${block.code.slice(0, selectionStart)}${indent}${block.code.slice(selectionEnd)}` })
    requestAnimationFrame(() => {
      target.selectionStart = selectionStart + indent.length
      target.selectionEnd = selectionStart + indent.length
    })
  }

  return (
    <div className="space-y-2">
      <Segmented
        full
        size="sm"
        value={block.mode}
        onChange={(mode: CodeBlockMode) =>
          // Seeding only on a switch keeps edits when the toggle is clicked back.
          patch(
            mode === 'terminal' && block.mode === 'editor'
              ? {
                  mode,
                  code: block.code.trim() ? block.code : DEFAULT_SESSION,
                  terminalPrompt: block.terminalPrompt || '~/carousel-studio $',
                  terminalTitle: block.terminalTitle || 'zsh — ~/carousel-studio',
                }
              : { mode },
          )
        }
        options={[
          { value: 'editor', label: 'Code window', icon: <Code2 size={13} /> },
          { value: 'terminal', label: 'Terminal', icon: <SquareTerminal size={13} /> },
        ]}
      />

      {terminal ? (
        <>
          <div>
            <Label>Terminal title / session</Label>
            <Input
              value={block.terminalTitle ?? ''}
              placeholder="admin@studio: ~/carousel-studio (zsh)"
              onChange={(event) => patch({ terminalTitle: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-ink-soft">Shown centred in the window titlebar.</p>
          </div>
          <div>
            <Label hint="Used to recognise your command lines">Prompt / path format</Label>
            <Input
              value={block.terminalPrompt ?? ''}
              placeholder="~/carousel-studio $"
              className="font-mono text-[12px]"
              onChange={(event) => patch({ terminalPrompt: event.target.value })}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <Label hint="Language follows the extension">Filename</Label>
            <Input
              value={block.filename ?? ''}
              placeholder="App.tsx"
              onChange={(event) => rename(event.target.value)}
            />
          </div>
          <div>
            <Label>Language</Label>
            <Select
              value={block.language}
              onChange={(event) => patch({ language: event.target.value as CodeLanguage })}
            >
              {CODE_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {LANGUAGE_LABELS[language]}
                </option>
              ))}
            </Select>
          </div>
          <Toggle
            checked={block.showLineNumbers ?? true}
            onChange={(showLineNumbers) => patch({ showLineNumbers })}
            label="Show line numbers"
            description="A muted gutter down the left edge"
          />
        </>
      )}

      <Select
        value={block.themeVariant ?? 'dark'}
        onChange={(event) => patch({ themeVariant: event.target.value as 'dark' | 'light' | 'theme-match' })}
      >
        <option value="dark">Dark window</option>
        <option value="light">Light window</option>
        <option value="theme-match">Match slide theme</option>
      </Select>

      <div>
        <SectionTitle
          hint={
            terminal
              ? 'Prefix commands with your prompt or $ (e.g. `$ pnpm run build`). Lines without a prompt render as output.'
              : undefined
          }
        >
          {terminal ? 'Terminal session' : 'Code'}
        </SectionTitle>
        <Textarea
          rows={7}
          spellCheck={false}
          value={block.code}
          onChange={(event) => patch({ code: event.target.value })}
          onKeyDown={onKeyDown}
          className="font-mono text-[12px] leading-relaxed"
        />
      </div>
    </div>
  )
}

function BlockFields({ block, patch }: { block: Block; patch: Patch }) {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return (
        <div className="space-y-2">
          <Textarea
            rows={block.type === 'heading' ? 2 : 4}
            value={block.text}
            onChange={(event) => patch({ text: event.target.value })}
          />
          <Segmented
            full
            size="sm"
            value={block.align ?? 'left'}
            onChange={(align) => patch({ align })}
            options={[
              { value: 'left', icon: <AlignLeft size={13} />, title: 'Left' },
              { value: 'center', icon: <AlignCenter size={13} />, title: 'Center' },
              { value: 'right', icon: <AlignRight size={13} />, title: 'Right' },
            ]}
          />
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-2">
          <Textarea rows={3} value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          <Input
            value={block.attribution ?? ''}
            placeholder="Attribution"
            onChange={(event) => patch({ attribution: event.target.value })}
          />
        </div>
      )

    case 'list':
      return (
        <div className="space-y-2">
          {block.items.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <Input
                value={item}
                onChange={(event) =>
                  patch({ items: block.items.map((value, i) => (i === index ? event.target.value : value)) })
                }
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                aria-label="Remove item"
                disabled={block.items.length <= 1}
                onClick={() => patch({ items: block.items.filter((_, i) => i !== index) })}
              >
                <X size={13} />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => patch({ items: [...block.items, 'New point'] })}
          >
            <Plus size={13} />
            Add item
          </Button>
          <Toggle
            checked={block.ordered ?? true}
            onChange={(ordered) => patch({ ordered })}
            label="Numbered list"
            description="Off shows simple bullet points"
          />
        </div>
      )

    case 'image':
      return <ImageField block={block} patch={patch} />

    case 'icon': {
      const ActiveIcon = getIcon(block.icon)
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2">
            <ActiveIcon size={18} className="text-brand" />
            <span className="text-[12px] text-ink-soft">Selected: {block.icon}</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {ICON_NAMES.map((name) => {
              const Icon = getIcon(name)
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => patch({ icon: name })}
                  className={cn(
                    'flex h-8 items-center justify-center rounded-lg border transition-colors',
                    name === block.icon ? 'border-brand bg-brand-soft text-brand' : 'border-line text-ink-soft hover:border-line-strong hover:text-ink',
                  )}
                >
                  <Icon size={15} />
                </button>
              )
            })}
          </div>
          <Input
            value={block.label ?? ''}
            placeholder="Optional label next to the icon"
            onChange={(event) => patch({ label: event.target.value })}
          />
        </div>
      )
    }

    case 'statistic':
      return (
        <div className="space-y-2">
          <Input value={block.value} placeholder="3×" onChange={(event) => patch({ value: event.target.value })} />
          <Textarea
            rows={2}
            value={block.label ?? ''}
            placeholder="What the number means"
            onChange={(event) => patch({ label: event.target.value })}
          />
          <Input
            value={block.caption ?? ''}
            placeholder="Optional caption"
            onChange={(event) => patch({ caption: event.target.value })}
          />
        </div>
      )

    case 'comparison':
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={block.leftLabel} onChange={(event) => patch({ leftLabel: event.target.value })} />
            <Input value={block.rightLabel} onChange={(event) => patch({ rightLabel: event.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Textarea
              rows={4}
              value={block.leftItems.join('\n')}
              onChange={(event) => patch({ leftItems: event.target.value.split('\n') })}
            />
            <Textarea
              rows={4}
              value={block.rightItems.join('\n')}
              onChange={(event) => patch({ rightItems: event.target.value.split('\n') })}
            />
          </div>
          <p className="text-[11px] text-ink-soft">One item per line, for each side.</p>
        </div>
      )

    case 'callout':
      return (
        <div className="space-y-2">
          <Textarea rows={3} value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          <Select value={block.tone} onChange={(event) => patch({ tone: event.target.value })}>
            <option value="info">Info</option>
            <option value="success">Positive</option>
            <option value="warning">Caution</option>
          </Select>
        </div>
      )

    case 'cta':
      return (
        <div className="space-y-2">
          <Textarea rows={2} value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          <Input
            value={block.subtext ?? ''}
            placeholder="Supporting line"
            onChange={(event) => patch({ subtext: event.target.value })}
          />
        </div>
      )

    case 'code':
      return <CodeField block={block} patch={patch} />
  }
}

function BlockCard({ slide, block }: { slide: Slide; block: Block }) {
  const selectedBlockId = useAppStore((state) => state.selectedBlockId)
  const selectBlock = useAppStore((state) => state.selectBlock)
  const updateBlock = useAppStore((state) => state.updateBlock)
  const deleteBlock = useAppStore((state) => state.deleteBlock)
  const moveBlock = useAppStore((state) => state.moveBlock)

  const meta = BLOCK_META[block.type]
  const Icon = meta.icon
  const selected = selectedBlockId === block.id
  const patch: Patch = (value) => updateBlock(slide.id, block.id, value)

  return (
    <div
      onMouseDown={() => selectBlock(block.id)}
      className={cn(
        'rounded-xl border p-3 transition-colors',
        selected ? 'border-brand bg-app ring-2 ring-brand/15' : 'border-line bg-app/50 hover:border-line-strong',
      )}
    >
      <header className="mb-2 flex items-center gap-2">
        <Icon size={14} className={selected ? 'text-brand' : 'text-ink-soft'} />
        <span className="text-[12px] font-semibold text-ink">{meta.label}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Move block up"
            onClick={() => moveBlock(slide.id, block.id, -1)}
          >
            <ArrowUp size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Move block down"
            onClick={() => moveBlock(slide.id, block.id, 1)}
          >
            <ArrowDown size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-danger"
            aria-label="Delete block"
            onClick={() => deleteBlock(slide.id, block.id)}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </header>

      <BlockFields block={block} patch={patch} />
      <AiTextActions block={block} apply={(next) => updateBlock(slide.id, block.id, next)} />
    </div>
  )
}

export function ContentPanel({ project }: { project: Project }) {
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const updateSlideLayout = useAppStore((state) => state.updateSlideLayout)
  const replaceSlide = useAppStore((state) => state.replaceSlide)
  const { toast } = useToast()
  const [regenerating, setRegenerating] = useState(false)

  const slide = project.slides.find((item) => item.id === activeSlideId) ?? project.slides[0]

  if (!slide) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong p-4 text-center text-xs text-ink-soft">
        Add a slide to start editing content.
      </p>
    )
  }

  const regenerate = async () => {
    setRegenerating(true)
    try {
      const next = await ai.regenerateSlide({ slide, projectTitle: project.title })
      replaceSlide(slide.id, next)
      toast('Slide content regenerated', 'success')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle hint={slide.layout === 'cta' ? 'Closing' : undefined}>Slide layout</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              title={layout.hint}
              onClick={() => updateSlideLayout(slide.id, layout.id)}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-[11px] transition-colors',
                layout.id === slide.layout
                  ? 'border-brand bg-brand-soft font-medium text-brand'
                  : 'border-line text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle hint={pluralize(slide.blocks.length, 'block')}>Slide content</SectionTitle>
        <div className="space-y-2.5">
          {slide.blocks.map((block) => (
            <BlockCard key={block.id} slide={slide} block={block} />
          ))}
        </div>
        <AddBlockMenu slideId={slide.id} />
        <Button variant="ghost" size="sm" className="mt-2.5 w-full" disabled={regenerating} onClick={regenerate}>
          {regenerating ? <Spinner size={13} /> : <Sparkles size={13} className="text-brand" />}
          Regenerate this slide with AI
        </Button>
      </section>
    </div>
  )
}
