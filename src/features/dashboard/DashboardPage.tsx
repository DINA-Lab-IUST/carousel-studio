import { Copy, Layers, MoreHorizontal, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Menu } from '../../components/ui/Menu'
import { Modal } from '../../components/ui/Modal'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useToast } from '../../components/ui/Toast'
import { getPlatform } from '../../lib/platforms'
import type { Project } from '../../lib/types'
import { formatRelative, pluralize } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { SlideFrame } from '../slides/SlideFrame'

const THUMB_WIDTH = 320

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const duplicateProject = useAppStore((state) => state.duplicateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const firstSlide = project.slides[0]

  return (
    <div className="group w-[320px] max-w-full">
      <div
        className="relative cursor-pointer overflow-hidden rounded-xl border border-line bg-surface shadow-app transition-transform duration-200 hover:-translate-y-0.5"
        onClick={onOpen}
      >
        {firstSlide ? (
          <SlideFrame project={project} slide={firstSlide} index={0} total={project.slides.length} width={THUMB_WIDTH} />
        ) : (
          <div className="flex h-[400px] items-center justify-center text-sm text-ink-soft">Empty project</div>
        )}
        <div
          className="absolute right-2.5 top-2.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <Menu
            trigger={({ toggle }) => (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 border-transparent bg-black/45 text-white backdrop-blur hover:border-transparent hover:bg-black/60"
                onClick={toggle}
                aria-label="Project actions"
              >
                <MoreHorizontal size={16} />
              </Button>
            )}
            items={[
              {
                label: 'Duplicate',
                icon: <Copy size={14} />,
                onSelect: () => {
                  duplicateProject(project.id)
                  toast('Project duplicated', 'success')
                },
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                danger: true,
                separatorBefore: true,
                onSelect: () => setConfirmOpen(true),
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="truncate text-sm font-semibold tracking-tight text-ink">{project.title}</h3>
        <p className="mt-1 text-xs text-ink-soft">
          {pluralize(project.slides.length, 'slide')} · {getPlatform(project.design.platformId).label} ·{' '}
          {formatRelative(project.updatedAt)}
        </p>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this carousel?"
        description="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              className="bg-danger hover:bg-danger/90 dark:text-white"
              onClick={() => {
                deleteProject(project.id)
                setConfirmOpen(false)
                toast('Carousel deleted', 'success')
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          “{project.title}” and its {pluralize(project.slides.length, 'slide')} will be removed from this browser.
        </p>
      </Modal>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const projects = useAppStore((state) => state.projects)
  const order = useAppStore((state) => state.order)

  const sorted = useMemo(
    () => order.map((id) => projects[id]).filter((project): project is Project => Boolean(project)),
    [order, projects],
  )

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 border-b border-line bg-app/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-white">
              <Layers size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">Carousel Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="primary" onClick={() => navigate('/new')}>
              <Plus size={15} />
              New carousel
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-[34px]">
            Turn one idea into a carousel worth swiping
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Give the app a thought, paste in something you have already written, or start from a blank canvas.
            Carousel Studio handles the structure, typography and polish — you keep the idea.
          </p>
        </div>

        <section className="mt-10">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Sparkles size={20} />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink">No carousels yet</h2>
              <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
                Start with an idea or a rough draft. The first version takes about a minute.
              </p>
              <Button variant="primary" size="lg" className="mt-5" onClick={() => navigate('/new')}>
                <Plus size={16} />
                Create your first carousel
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Your carousels</h2>
                <span className="text-xs text-ink-soft">{pluralize(sorted.length, 'project')}</span>
              </div>
              <div className="flex flex-wrap gap-6">
                {sorted.map((project) => (
                  <ProjectCard key={project.id} project={project} onOpen={() => navigate(`/editor/${project.id}`)} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
