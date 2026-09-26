import { ChevronLeft, Download, Eye, PanelLeft, Redo2, SlidersHorizontal, Sparkles, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { getPlatform } from '../../lib/platforms'
import type { Project } from '../../lib/types'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/store'

export function TopBar({
  project,
  onOpenExport,
  onOpenAi,
  onToggleRail,
  onTogglePanel,
  railOpen,
  panelOpen,
}: {
  project: Project
  onOpenExport: () => void
  onOpenAi: () => void
  onToggleRail: () => void
  onTogglePanel: () => void
  railOpen: boolean
  panelOpen: boolean
}) {
  const navigate = useNavigate()
  const renameProject = useAppStore((state) => state.renameProject)
  const undo = useAppStore((state) => state.undo)
  const redo = useAppStore((state) => state.redo)
  const canUndo = useAppStore((state) => state.past.length > 0)
  const canRedo = useAppStore((state) => state.future.length > 0)

  const [title, setTitle] = useState(project.title)

  useEffect(() => {
    setTitle(project.title)
  }, [project.id])

  const commitTitle = () => {
    const next = title.trim() || 'Untitled carousel'
    setTitle(next)
    if (next !== project.title) renameProject(project.id, next)
  }

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
      <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label="Back to all carousels">
        <ChevronLeft size={17} />
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') {
              setTitle(project.title)
              event.currentTarget.blur()
            }
          }}
          aria-label="Carousel title"
          className="w-40 truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold tracking-tight text-ink outline-none transition-colors hover:border-line focus:border-brand focus:bg-app sm:w-64"
        />
        <span className="hidden shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft xl:inline">
          {getPlatform(project.design.platformId).label}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⇧⌘Z)"
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </Button>

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <Button variant="secondary" onClick={onOpenAi} title="AI assist" className="hidden sm:inline-flex">
          <Sparkles size={15} className="text-brand" />
          AI assist
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/editor/${project.id}/preview`)} title="Preview (P)">
          <Eye size={15} />
          <span className="hidden md:inline">Preview</span>
        </Button>
        <Button variant="primary" onClick={onOpenExport} title="Export (E)">
          <Download size={15} />
          <span className="hidden md:inline">Export</span>
        </Button>

        <span className="mx-1 hidden h-6 w-px bg-line lg:block" />
        <span className="hidden lg:block">
          <ThemeToggle />
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRail}
          className={cn('lg:hidden', !railOpen && 'text-ink-soft')}
          title="Toggle slide list"
          aria-label="Toggle slide list"
        >
          <PanelLeft size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          className={cn('xl:hidden', !panelOpen && 'text-ink-soft')}
          title="Toggle design panel"
          aria-label="Toggle design panel"
        >
          <SlidersHorizontal size={16} />
        </Button>
      </div>
    </header>
  )
}
