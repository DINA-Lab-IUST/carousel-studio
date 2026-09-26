import {
  ChevronLeft,
  ChevronRight,
  Globe,
  MessageCircle,
  Repeat2,
  Send,
  ThumbsUp,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Segmented'
import { loadBrandKit } from '../../lib/brand'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { SlideFrame } from '../slides/SlideFrame'

const POST_WIDTH = 520

export function PreviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const project = useAppStore((state) => (projectId ? state.projects[projectId] : undefined))
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<'linkedin' | 'clean'>('linkedin')

  const brand = useMemo(() => loadBrandKit(), [])
  const total = project?.slides.length ?? 0

  useEffect(() => {
    if (!project) navigate('/', { replace: true })
  }, [project, navigate])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((value) => Math.min(value + 1, Math.max(0, total - 1)))
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(value - 1, 0))
      if (event.key === 'Escape' && projectId) navigate(`/editor/${projectId}`)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total, navigate, projectId])

  if (!project || total === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d12] text-sm text-white/70">
        Nothing to preview yet.
      </div>
    )
  }

  const safeIndex = Math.min(index, total - 1)
  const slide = project.slides[safeIndex]
  const step = (direction: -1 | 1) =>
    setIndex((value) => Math.max(0, Math.min(value + direction, total - 1)))

  const initials = (brand?.name || project.title)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  const avatar = brand?.logoUrl ?? project.logoUrl

  const arrows = (
    <>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={safeIndex === 0}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-opacity hover:bg-black/65 disabled:opacity-0"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={safeIndex >= total - 1}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-opacity hover:bg-black/65 disabled:opacity-0"
      >
        <ChevronRight size={18} />
      </button>
    </>
  )

  const dots = (
    <div className="flex items-center justify-center gap-1.5">
      {project.slides.map((item, dotIndex) => (
        <button
          key={item.id}
          type="button"
          aria-label={`Go to slide ${dotIndex + 1}`}
          onClick={() => setIndex(dotIndex)}
          className={cn(
            'h-1.5 rounded-full transition-all',
            dotIndex === safeIndex ? 'w-5 bg-brand' : 'w-1.5 bg-white/30 hover:bg-white/50',
          )}
        />
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0d12]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => navigate(`/editor/${project.id}`)}
          aria-label="Back to editor"
        >
          <X size={17} />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{project.title}</p>
          <p className="text-[11px] text-white/50">
            {safeIndex + 1} of {total}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'linkedin', label: 'In feed' },
              { value: 'clean', label: 'Clean' },
            ]}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/editor/${project.id}`)}
            className="hidden sm:inline-flex"
          >
            Back to editor
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8">
        {mode === 'linkedin' ? (
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-start gap-3 px-4 pt-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-sm font-semibold text-white">
                {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{brand?.name || 'Your name'}</p>
                <p className="truncate text-xs text-neutral-500">
                  {brand?.name ? 'Creator' : 'Building in public'} · Carousel Studio
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
                  now · <Globe size={11} />
                </p>
              </div>
            </div>

            <p className="px-4 py-3 text-sm leading-relaxed text-neutral-800">{project.title}</p>

            <div className="relative">
              {arrows}
              <SlideFrame
                project={project}
                slide={slide}
                index={safeIndex}
                total={total}
                width={POST_WIDTH}
                className="border-y border-neutral-200"
              />
              <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                {safeIndex + 1}/{total}
              </span>
            </div>

            <div className="flex items-center justify-around px-4 py-3 text-neutral-500">
              <span className="flex items-center gap-1.5 text-xs">
                <ThumbsUp size={15} /> Like
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <MessageCircle size={15} /> Comment
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Repeat2 size={15} /> Repost
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Send size={15} /> Send
              </span>
            </div>
          </div>
        ) : (
          <div className="relative">
            {arrows}
            <div className="overflow-hidden rounded-lg shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
              <SlideFrame project={project} slide={slide} index={safeIndex} total={total} width={POST_WIDTH} />
            </div>
          </div>
        )}

        {dots}
        <p className="text-[11px] text-white/40">
          Use ← → to move between slides, Esc to go back to the editor.
        </p>
      </main>
    </div>
  )
}
