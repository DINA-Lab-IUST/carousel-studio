import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { getPlatform } from '../../lib/platforms'
import type { Project } from '../../lib/types'
import { clamp, cn } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { SlideFrame } from '../slides/SlideFrame'
import { AddSlideMenu } from './AddSlideMenu'

export function Canvas({ project }: { project: Project }) {
  const platform = getPlatform(project.design.platformId)
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const selectedBlockId = useAppStore((state) => state.selectedBlockId)
  const selectSlide = useAppStore((state) => state.selectSlide)
  const selectBlock = useAppStore((state) => state.selectBlock)
  const updateBlock = useAppStore((state) => state.updateBlock)
  const addSlide = useAppStore((state) => state.addSlide)
  const zoom = useAppStore((state) => state.zoom)
  const setZoom = useAppStore((state) => state.setZoom)

  const containerRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.5)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const measure = () => {
      const rect = element.getBoundingClientRect()
      const horizontal = (rect.width - 120) / platform.width
      const vertical = (rect.height - 140) / platform.height
      setFit(Math.max(0.12, Math.min(horizontal, vertical, 1)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [platform.width, platform.height])

  const scale = zoom === 'fit' ? fit : zoom
  const index = project.slides.findIndex((slide) => slide.id === activeSlideId)
  const slide = project.slides[index] ?? project.slides[0]
  const total = project.slides.length

  const step = (direction: -1 | 1) => {
    const target = project.slides[clamp(index + direction, 0, total - 1)]
    if (target) selectSlide(target.id)
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in srgb, var(--app-border-strong) 55%, transparent) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
        onClick={() => selectBlock(null)}
      >
        {slide ? (
          <div
            className="overflow-hidden rounded-[3px] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/5"
            onClick={(event) => event.stopPropagation()}
          >
            <SlideFrame
              project={project}
              slide={slide}
              index={index < 0 ? 0 : index}
              total={total}
              width={platform.width * scale}
              interactive
              selectedBlockId={selectedBlockId}
              onSelectBlock={selectBlock}
              onPatchBlock={(blockId, patch) => updateBlock(slide.id, blockId, patch)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-8 py-12 text-center">
            <p className="text-sm text-ink-soft">This carousel has no slides yet.</p>
            <AddSlideMenu onAdd={(layout) => addSlide(layout)} variant="primary" size="md" />
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-line bg-surface/95 px-2 py-1.5 shadow-app backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index <= 0}
            onClick={() => step(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft size={15} />
          </Button>
          <span className="min-w-[54px] text-center text-xs tabular-nums text-ink-soft">
            {total === 0 ? '0 / 0' : `${Math.max(index, 0) + 1} / ${total}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index >= total - 1}
            onClick={() => step(1)}
            aria-label="Next slide"
          >
            <ChevronRight size={15} />
          </Button>

          <span className="mx-1 h-5 w-px bg-line" />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(clamp(scale - 0.05, 0.12, 1.5))}
            aria-label="Zoom out"
          >
            <Minus size={14} />
          </Button>
          <button
            type="button"
            onClick={() => setZoom('fit')}
            title="Fit to view"
            className={cn(
              'min-w-[46px] rounded-md px-1.5 py-1 text-xs tabular-nums transition-colors',
              zoom === 'fit' ? 'text-brand' : 'text-ink-soft hover:text-ink',
            )}
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(clamp(scale + 0.05, 0.12, 1.5))}
            aria-label="Zoom in"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
