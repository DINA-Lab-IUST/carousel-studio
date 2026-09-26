import { Copy, GripVertical, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Menu } from '../../components/ui/Menu'
import { getPlatform } from '../../lib/platforms'
import type { Project } from '../../lib/types'
import { cn, pluralize } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { SlideFrame } from '../slides/SlideFrame'
import { AddSlideMenu } from './AddSlideMenu'

const THUMB_WIDTH = 132

export function SlideRail({ project, visible }: { project: Project; visible: boolean }) {
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const selectSlide = useAppStore((state) => state.selectSlide)
  const moveSlide = useAppStore((state) => state.moveSlide)
  const duplicateSlide = useAppStore((state) => state.duplicateSlide)
  const deleteSlide = useAppStore((state) => state.deleteSlide)
  const addSlide = useAppStore((state) => state.addSlide)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const platform = getPlatform(project.design.platformId)

  if (!visible) return null

  return (
    <aside className="flex w-[188px] shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          {pluralize(project.slides.length, 'slide')}
        </span>
        <span className="text-[11px] text-ink-soft">
          {platform.width}×{platform.height}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {project.slides.length === 0 && (
          <p className="rounded-xl border border-dashed border-line-strong px-3 py-6 text-center text-xs text-ink-soft">
            No slides yet — add the first one below.
          </p>
        )}

        {project.slides.map((slide, index) => {
          const active = slide.id === activeSlideId
          return (
            <div
              key={slide.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setOverIndex(index)
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (dragIndex !== null && dragIndex !== index) moveSlide(dragIndex, index)
                setDragIndex(null)
                setOverIndex(null)
              }}
              onClick={() => selectSlide(slide.id)}
              className={cn(
                'group relative cursor-pointer rounded-xl border bg-app p-1.5 transition-all',
                active ? 'border-brand ring-2 ring-brand/25' : 'border-line hover:border-line-strong',
                dragIndex === index && 'opacity-40',
                overIndex === index && dragIndex !== null && dragIndex !== index && 'border-brand/60',
              )}
            >
              <SlideFrame project={project} slide={slide} index={index} total={project.slides.length} width={THUMB_WIDTH} />

              <div className="mt-1.5 flex items-center justify-between px-1">
                <span className="flex items-center gap-1 text-[11px] font-medium text-ink-soft">
                  <GripVertical size={12} className="opacity-50" />
                  {index + 1}
                </span>
                <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <Menu
                    align="right"
                    trigger={({ toggle }) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggle()
                        }}
                        aria-label="Slide actions"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    )}
                    items={[
                      {
                        label: 'Duplicate slide',
                        icon: <Copy size={14} />,
                        onSelect: () => duplicateSlide(slide.id),
                      },
                      {
                        label: 'Delete slide',
                        icon: <Trash2 size={14} />,
                        danger: true,
                        separatorBefore: true,
                        onSelect: () => deleteSlide(slide.id),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-line p-3">
        <AddSlideMenu onAdd={(layout) => addSlide(layout)} align="left" className="w-full" />
      </div>
    </aside>
  )
}
