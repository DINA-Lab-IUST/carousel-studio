import { Download, FileText, Image as ImageIcon, Layers } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { buildPdf, buildZip, captureSlide, type ExportImage } from '../../lib/export'
import { getPlatform } from '../../lib/platforms'
import type { Project } from '../../lib/types'
import { downloadBlob, downloadDataUrl, slugify } from '../../lib/utils'
import { useAppStore } from '../../store/store'
import { SlideView } from '../slides/SlideView'

type Job = 'current' | 'zip' | 'pdf'

export function ExportModal({
  project,
  open,
  onClose,
}: {
  project: Project
  open: boolean
  onClose: () => void
}) {
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<Job | null>(null)
  const [progress, setProgress] = useState(0)

  const platform = getPlatform(project.design.platformId)
  const filenames = project.slides.map(
    (_, index) => `${slugify(project.title)}-${String(index + 1).padStart(2, '0')}.png`,
  )

  useEffect(() => {
    if (!open) {
      setBusy(null)
      setProgress(0)
    }
  }, [open])

  const captureAll = async (): Promise<ExportImage[]> => {
    const nodes = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-export-index]') ?? [])
    const images: ExportImage[] = []
    for (let index = 0; index < nodes.length; index += 1) {
      setProgress(Math.round((index / Math.max(1, nodes.length)) * 100))
      const dataUrl = await captureSlide(nodes[index], platform.width, platform.height)
      images.push({ name: filenames[index], dataUrl })
    }
    setProgress(100)
    return images
  }

  const run = async (job: Job) => {
    if (project.slides.length === 0) {
      toast('Add a slide before exporting', 'error')
      return
    }
    setBusy(job)
    setProgress(0)
    try {
      if (job === 'current') {
        const nodes = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-export-index]') ?? [])
        const index = Math.max(
          0,
          project.slides.findIndex((slide) => slide.id === activeSlideId),
        )
        const node = nodes[index]
        if (!node) return
        const dataUrl = await captureSlide(node, platform.width, platform.height)
        downloadDataUrl(dataUrl, filenames[index])
        toast('Slide exported as PNG', 'success')
        onClose()
        return
      }

      const images = await captureAll()
      if (job === 'zip') {
        downloadBlob(await buildZip(images), `${slugify(project.title)}-carousel.zip`)
        toast(`Exported ${images.length} slides as PNGs`, 'success')
      } else {
        downloadBlob(await buildPdf(images, platform.width, platform.height), `${slugify(project.title)}.pdf`)
        toast('Exported PDF deck', 'success')
      }
      onClose()
    } catch {
      toast('Export failed — try again', 'error')
    } finally {
      setBusy(null)
      setProgress(0)
    }
  }

  const options: { job: Job; title: string; description: string; icon: typeof ImageIcon }[] = [
    {
      job: 'current',
      title: 'Current slide',
      description: `One PNG at ${platform.width}×${platform.height}`,
      icon: ImageIcon,
    },
    {
      job: 'zip',
      title: 'All slides',
      description: `${project.slides.length} PNGs in a single ZIP`,
      icon: Layers,
    },
    {
      job: 'pdf',
      title: 'PDF deck',
      description: 'One page per slide, ready for LinkedIn documents',
      icon: FileText,
    },
  ]

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Export carousel"
        description={`Rendered locally at ${platform.width}×${platform.height}px`}
        size="md"
      >
        <div className="space-y-2">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.job}
                className="flex items-center gap-3 rounded-xl border border-line bg-app/60 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{option.title}</p>
                  <p className="text-[11px] text-ink-soft">{option.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={option.job === 'current' ? 'secondary' : 'primary'}
                  disabled={busy !== null}
                  onClick={() => run(option.job)}
                >
                  {busy === option.job ? <Spinner size={13} /> : <Download size={13} />}
                  Export
                </Button>
              </div>
            )
          })}
        </div>

        {busy && busy !== 'current' && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-soft">Rendering slides… {progress}%</p>
          </div>
        )}
      </Modal>

      {/* Offscreen render surface: exactly what the user sees, at native size. */}
      <div
        ref={containerRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: -100000,
          top: 0,
          width: platform.width,
          height: platform.height,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {open &&
          project.slides.map((slide, index) => (
            <div key={slide.id} data-export-index={index} style={{ width: platform.width, height: platform.height }}>
              <SlideView project={project} slide={slide} index={index} total={project.slides.length} />
            </div>
          ))}
      </div>
    </>
  )
}
