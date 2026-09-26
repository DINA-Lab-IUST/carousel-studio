import { ArrowLeft, Layers, Minus, Plus, Scissors, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Label, Select, Textarea } from '../../components/ui/Field'
import { Spinner } from '../../components/ui/Spinner'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useToast } from '../../components/ui/Toast'
import { DEFAULT_PLATFORM, PLATFORMS } from '../../lib/platforms'
import { createStarterSlides } from '../../lib/project'
import { outlineToSlides } from '../../lib/outline'
import { DEFAULT_THEME_ID, THEMES } from '../../lib/themes'
import type { PlatformId } from '../../lib/types'
import { clamp } from '../../lib/utils'
import { ai } from '../../services/ai'
import { useAppStore } from '../../store/store'
import { ThemeSwatch } from '../themes/ThemeSwatch'

const EXAMPLE_IDEAS = [
  '5 lessons from my first year freelancing',
  'Why most onboarding flows lose people in the first 30 seconds',
  'How I plan a full week in twenty minutes',
]

type Mode = 'outline' | 'split' | 'blank'
type Busy = Mode | null

export function NewProjectPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createFromSlides = useAppStore((state) => state.createFromSlides)

  const [content, setContent] = useState('')
  const [count, setCount] = useState(7)
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID)
  const [platformId, setPlatformId] = useState<PlatformId>(DEFAULT_PLATFORM)
  const [busy, setBusy] = useState<Busy>(null)

  const run = async (mode: Mode) => {
    if (mode !== 'blank' && !content.trim()) {
      toast('Add an idea or paste some content first', 'error')
      return
    }
    setBusy(mode)
    try {
      if (mode === 'outline') {
        const outline = await ai.generateOutline({ idea: content, slideCount: count })
        const id = createFromSlides({
          title: outline.title,
          slides: outlineToSlides(outline),
          platformId,
          themeId,
        })
        toast('Outline generated — edit anything', 'success')
        navigate(`/editor/${id}`)
        return
      }
      if (mode === 'split') {
        const outline = await ai.splitContent({ text: content })
        const id = createFromSlides({
          title: outline.title,
          slides: outlineToSlides(outline),
          platformId,
          themeId,
        })
        toast('Content split into slides', 'success')
        navigate(`/editor/${id}`)
        return
      }
      const title = content.trim().split('\n')[0].trim() || 'Untitled carousel'
      const id = createFromSlides({ title, slides: createStarterSlides(), platformId, themeId })
      navigate(`/editor/${id}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 border-b border-line bg-app/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5 text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-white">
              <Layers size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Carousel Studio</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} />
          All carousels
        </button>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">What is the carousel about?</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              One idea is enough. If you already have a draft, paste it whole — the app will split it into slides.
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-surface p-4 shadow-app">
              <Textarea
                rows={9}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={'e.g. Everything I learned shipping a side project for two years…\n\nPaste long-form text here and split it, or write a single idea and generate an outline.'}
                className="border-transparent bg-transparent px-1 text-[14px] focus:border-transparent focus:ring-0"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <span className="text-[11px] uppercase tracking-wide text-ink-soft">Try one</span>
                {EXAMPLE_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setContent(idea)}
                    className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" disabled={busy !== null} onClick={() => run('outline')}>
                {busy === 'outline' ? <Spinner size={15} /> : <Sparkles size={16} />}
                Generate outline
              </Button>
              <Button size="lg" disabled={busy !== null} onClick={() => run('split')}>
                {busy === 'split' ? <Spinner size={15} /> : <Scissors size={15} />}
                Split into slides
              </Button>
              <Button variant="ghost" size="lg" disabled={busy !== null} onClick={() => run('blank')}>
                <Wand2 size={15} />
                Start blank
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              {busy
                ? 'Working on your structure…'
                : 'Generation uses a local mock assistant — swap in a real provider later without changing the editor.'}
            </p>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <Label hint={`${count} slides`}>Carousel length</Label>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  onClick={() => setCount((value) => clamp(value - 1, 4, 10))}
                  aria-label="Fewer slides"
                >
                  <Minus size={14} />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-semibold tabular-nums text-ink">{count}</span>
                  <span className="ml-1 text-xs text-ink-soft">slides</span>
                </div>
                <Button
                  size="icon"
                  onClick={() => setCount((value) => clamp(value + 1, 4, 10))}
                  aria-label="More slides"
                >
                  <Plus size={14} />
                </Button>
              </div>

              <div className="mt-5">
                <Label>Platform</Label>
                <Select value={platformId} onChange={(event) => setPlatformId(event.target.value as PlatformId)}>
                  {PLATFORMS.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.label} · {platform.width}×{platform.height}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4">
              <Label hint={THEMES.find((theme) => theme.id === themeId)?.name}>Starting theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    title={theme.name}
                    className={
                      'rounded-xl border p-1 transition-all ' +
                      (theme.id === themeId
                        ? 'border-brand ring-2 ring-brand/30'
                        : 'border-line hover:border-line-strong')
                    }
                  >
                    <ThemeSwatch theme={theme} />
                    <span className="mt-1 block truncate text-center text-[10px] text-ink-soft">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
