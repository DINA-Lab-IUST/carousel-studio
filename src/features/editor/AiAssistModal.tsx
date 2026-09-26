import { RefreshCw, Sparkles, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import type { Project } from '../../lib/types'
import { ai } from '../../services/ai'
import { useAppStore } from '../../store/store'

type Job = 'hooks' | 'cta' | 'slide'

export function AiAssistModal({
  project,
  open,
  onClose,
}: {
  project: Project
  open: boolean
  onClose: () => void
}) {
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const updateBlock = useAppStore((state) => state.updateBlock)
  const replaceSlide = useAppStore((state) => state.replaceSlide)
  const { toast } = useToast()

  const [busy, setBusy] = useState<Job | null>(null)
  const [hooks, setHooks] = useState<string[]>([])
  const [ctas, setCtas] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setHooks([])
    setCtas([])
  }, [open])

  const coverSlide = project.slides[0]
  const lastSlide = project.slides[project.slides.length - 1]
  const activeSlide = project.slides.find((slide) => slide.id === activeSlideId) ?? coverSlide
  const coverHeading = coverSlide?.blocks.find((block) => block.type === 'heading')
  const ctaBlock = lastSlide?.blocks.find((block) => block.type === 'cta')

  const loadHooks = async () => {
    setBusy('hooks')
    try {
      setHooks(await ai.generateHooks({ topic: project.title }))
    } finally {
      setBusy(null)
    }
  }

  const applyHook = (text: string) => {
    if (!coverSlide || !coverHeading) {
      toast('Add a heading block to your cover slide first', 'error')
      return
    }
    updateBlock(coverSlide.id, coverHeading.id, { text })
    toast('Cover hook updated', 'success')
  }

  const loadCtas = async () => {
    setBusy('cta')
    try {
      setCtas(await ai.improveCta({ text: ctaBlock?.type === 'cta' ? ctaBlock.text : project.title }))
    } finally {
      setBusy(null)
    }
  }

  const applyCta = (text: string) => {
    if (!lastSlide || !ctaBlock) {
      toast('Add a call-to-action block to the last slide first', 'error')
      return
    }
    updateBlock(lastSlide.id, ctaBlock.id, { text })
    toast('Call to action updated', 'success')
  }

  const regenerate = async () => {
    if (!activeSlide) return
    setBusy('slide')
    try {
      const next = await ai.regenerateSlide({ slide: activeSlide, projectTitle: project.title })
      replaceSlide(activeSlide.id, next)
      toast('Current slide regenerated', 'success')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI assist"
      description="Structured suggestions you can apply with one click"
      size="lg"
    >
      <div className="space-y-6">
        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <Sparkles size={14} className="text-brand" />
                Stronger hooks
              </h3>
              <p className="text-[11px] text-ink-soft">Sharper opening lines for your cover slide.</p>
            </div>
            <Button size="sm" variant="secondary" disabled={busy !== null} onClick={loadHooks}>
              {busy === 'hooks' ? <Spinner size={13} /> : <Sparkles size={13} />}
              {hooks.length > 0 ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          {hooks.length > 0 && (
            <ul className="space-y-1.5">
              {hooks.map((hook) => (
                <li
                  key={hook}
                  className="flex items-center gap-3 rounded-lg border border-line bg-app/60 px-3 py-2"
                >
                  <span className="flex-1 text-[13px] text-ink">{hook}</span>
                  <Button size="sm" variant="soft" onClick={() => applyHook(hook)}>
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <Target size={14} className="text-brand" />
                Better call to action
              </h3>
              <p className="text-[11px] text-ink-soft">Applied to the CTA block on your last slide.</p>
            </div>
            <Button size="sm" variant="secondary" disabled={busy !== null} onClick={loadCtas}>
              {busy === 'cta' ? <Spinner size={13} /> : <Sparkles size={13} />}
              {ctas.length > 0 ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          {ctas.length > 0 && (
            <ul className="space-y-1.5">
              {ctas.map((cta) => (
                <li key={cta} className="flex items-center gap-3 rounded-lg border border-line bg-app/60 px-3 py-2">
                  <span className="flex-1 text-[13px] text-ink">{cta}</span>
                  <Button size="sm" variant="soft" onClick={() => applyCta(cta)}>
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex items-center justify-between gap-3 rounded-xl border border-line bg-app/60 p-3">
          <div>
            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <RefreshCw size={14} className="text-brand" />
              Regenerate the current slide
            </h3>
            <p className="text-[11px] text-ink-soft">
              Keeps the layout, replaces the content with a fresh take.
            </p>
          </div>
          <Button size="sm" variant="secondary" disabled={busy !== null} onClick={regenerate}>
            {busy === 'slide' ? <Spinner size={13} /> : <RefreshCw size={13} />}
            Regenerate
          </Button>
        </section>

        <p className="text-[11px] leading-relaxed text-ink-soft">
          Suggestions come from a local mock assistant that returns structured slide data. Connect a real provider
          later without changing the editor.
        </p>
      </div>
    </Modal>
  )
}
