import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../store/store'
import { AiAssistModal } from './AiAssistModal'
import { Canvas } from './Canvas'
import { ExportModal } from './ExportModal'
import { RightPanel } from './RightPanel'
import { SlideRail } from './SlideRail'
import { TopBar } from './TopBar'

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const project = useAppStore((state) => (projectId ? state.projects[projectId] : undefined))
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  const selectedBlockId = useAppStore((state) => state.selectedBlockId)
  const openProject = useAppStore((state) => state.openProject)
  const selectSlide = useAppStore((state) => state.selectSlide)
  const deleteBlock = useAppStore((state) => state.deleteBlock)
  const duplicateSlide = useAppStore((state) => state.duplicateSlide)
  const undo = useAppStore((state) => state.undo)
  const redo = useAppStore((state) => state.redo)

  const [exportOpen, setExportOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  // On narrow screens start with the canvas front and centre; both panels stay one click away.
  const [railOpen, setRailOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  const [panelOpen, setPanelOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 1280)

  useEffect(() => {
    if (!projectId) return
    if (!project) {
      navigate('/', { replace: true })
      return
    }
    if (activeProjectId !== projectId) openProject(projectId)
  }, [projectId, project, activeProjectId, openProject, navigate])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const editing =
        Boolean(target?.isContentEditable) ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      const mod = event.metaKey || event.ctrlKey

      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (mod && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        if (activeSlideId) duplicateSlide(activeSlideId)
        return
      }
      if (editing || !project) return

      const index = project.slides.findIndex((slide) => slide.id === activeSlideId)
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        const next = project.slides[Math.min(index + 1, project.slides.length - 1)]
        if (next) selectSlide(next.id)
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        const previous = project.slides[Math.max(index - 1, 0)]
        if (previous) selectSlide(previous.id)
        return
      }
      if ((event.key === 'Backspace' || event.key === 'Delete') && activeSlideId && selectedBlockId) {
        event.preventDefault()
        deleteBlock(activeSlideId, selectedBlockId)
        return
      }
      if (event.key.toLowerCase() === 'p') {
        navigate(`/editor/${projectId}/preview`)
      }
      if (event.key.toLowerCase() === 'e') setExportOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    project,
    projectId,
    activeSlideId,
    selectedBlockId,
    selectSlide,
    deleteBlock,
    duplicateSlide,
    undo,
    redo,
    navigate,
  ])

  if (!project) return <div className="min-h-screen bg-app" />

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app">
      <TopBar
        project={project}
        onOpenExport={() => setExportOpen(true)}
        onOpenAi={() => setAiOpen(true)}
        onToggleRail={() => setRailOpen((value) => !value)}
        onTogglePanel={() => setPanelOpen((value) => !value)}
        railOpen={railOpen}
        panelOpen={panelOpen}
      />

      <div className="flex min-h-0 flex-1">
        <SlideRail project={project} visible={railOpen} />
        <Canvas project={project} />
        <RightPanel project={project} visible={panelOpen} />
      </div>

      <ExportModal project={project} open={exportOpen} onClose={() => setExportOpen(false)} />
      <AiAssistModal project={project} open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
