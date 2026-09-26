import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createBlock, createSlide as buildSlide } from '../lib/blocks'
import { newId } from '../lib/ids'
import { createProject as buildProject } from '../lib/project'
import { createSampleProject } from '../lib/sampleProject'
import type {
  Block,
  BlockType,
  LayoutId,
  PlatformId,
  Project,
  ProjectDesign,
  Slide,
  ThemeTokens,
} from '../lib/types'

export type PanelTab = 'content' | 'design'
export type AppTheme = 'light' | 'dark' | 'system'

interface CreateFromSlidesInput {
  title: string
  slides: Slide[]
  platformId?: PlatformId
  themeId?: string
}

interface AppState {
  // persisted data
  projects: Record<string, Project>
  order: string[]
  appTheme: AppTheme

  // editor session state (intentionally not persisted)
  activeProjectId: string | null
  activeSlideId: string | null
  selectedBlockId: string | null
  panelTab: PanelTab
  zoom: number | 'fit'
  past: Project[]
  future: Project[]

  setAppTheme: (theme: AppTheme) => void

  createFromSlides: (input: CreateFromSlidesInput) => string
  duplicateProject: (id: string) => string | undefined
  deleteProject: (id: string) => void
  renameProject: (id: string, title: string) => void
  openProject: (id: string) => void
  closeProject: () => void

  setPlatform: (platformId: PlatformId) => void
  setTheme: (themeId: string) => void
  setOverrides: (patch: Partial<ThemeTokens>) => void
  resetOverrides: () => void
  setDesign: (patch: Partial<ProjectDesign>) => void
  setLogo: (logoUrl?: string) => void

  addSlide: (layout: LayoutId, index?: number) => void
  updateSlideLayout: (slideId: string, layout: LayoutId) => void
  deleteSlide: (slideId: string) => void
  duplicateSlide: (slideId: string) => void
  moveSlide: (from: number, to: number) => void

  addBlock: (slideId: string, type: BlockType) => void
  updateBlock: (slideId: string, blockId: string, patch: Record<string, unknown>) => void
  deleteBlock: (slideId: string, blockId: string) => void
  moveBlock: (slideId: string, blockId: string, direction: -1 | 1) => void
  replaceSlide: (slideId: string, next: Slide) => void

  selectSlide: (slideId: string) => void
  selectBlock: (blockId: string | null) => void
  setPanelTab: (tab: PanelTab) => void
  setZoom: (zoom: number | 'fit') => void

  undo: () => void
  redo: () => void
}

const HISTORY_LIMIT = 50

const seedProject = createSampleProject()

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const activeProject = (): Project | undefined => {
        const { activeProjectId, projects } = get()
        return activeProjectId ? projects[activeProjectId] : undefined
      }

      /** Every document change goes through here: snapshot for undo, then apply. */
      const commit = (mutate: (project: Project) => void) => {
        const project = activeProject()
        if (!project) return
        const snapshot = structuredClone(project)
        const draft = structuredClone(project)
        mutate(draft)
        draft.updatedAt = Date.now()
        set((state) => ({
          projects: { ...state.projects, [project.id]: draft },
          past: [...state.past, snapshot].slice(-HISTORY_LIMIT),
          future: [],
        }))
      }

      const mutateSlide = (slideId: string, mutator: (slide: Slide) => void) => {
        commit((project) => {
          const slide = project.slides.find((item) => item.id === slideId)
          if (slide) mutator(slide)
        })
      }

      return {
        projects: { [seedProject.id]: seedProject },
        order: [seedProject.id],
        appTheme: 'system',

        activeProjectId: null,
        activeSlideId: null,
        selectedBlockId: null,
        panelTab: 'content',
        zoom: 'fit',
        past: [],
        future: [],

        setAppTheme: (theme) => set({ appTheme: theme }),

        createFromSlides: ({ title, slides, platformId, themeId }) => {
          const project = buildProject({ title, slides, platformId, themeId })
          set((state) => ({
            projects: { ...state.projects, [project.id]: project },
            order: [project.id, ...state.order],
            activeProjectId: project.id,
            activeSlideId: project.slides[0]?.id ?? null,
            selectedBlockId: null,
            panelTab: 'content',
            past: [],
            future: [],
          }))
          return project.id
        },

        duplicateProject: (id) => {
          const source = get().projects[id]
          if (!source) return undefined
          const copy: Project = {
            ...structuredClone(source),
            id: newId('prj'),
            title: `${source.title} copy`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            slides: source.slides.map((slide) => ({
              ...structuredClone(slide),
              id: newId('sld'),
              blocks: slide.blocks.map((block) => ({ ...structuredClone(block), id: newId('blk') })),
            })),
          }
          set((state) => ({
            projects: { ...state.projects, [copy.id]: copy },
            order: [copy.id, ...state.order],
          }))
          return copy.id
        },

        deleteProject: (id) =>
          set((state) => {
            const nextProjects = { ...state.projects }
            delete nextProjects[id]
            return {
              projects: nextProjects,
              order: state.order.filter((projectId) => projectId !== id),
              activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
            }
          }),

        renameProject: (id, title) =>
          set((state) => {
            const project = state.projects[id]
            if (!project) return {}
            return {
              projects: { ...state.projects, [id]: { ...project, title, updatedAt: Date.now() } },
            }
          }),

        openProject: (id) => {
          const project = get().projects[id]
          if (!project) return
          set({
            activeProjectId: id,
            activeSlideId: project.slides[0]?.id ?? null,
            selectedBlockId: null,
            past: [],
            future: [],
          })
        },

        closeProject: () => set({ activeProjectId: null, activeSlideId: null, selectedBlockId: null, past: [], future: [] }),

        setPlatform: (platformId) =>
          commit((project) => {
            project.design.platformId = platformId
          }),

        setTheme: (themeId) =>
          commit((project) => {
            project.design.themeId = themeId
          }),

        setOverrides: (patch) =>
          commit((project) => {
            project.design.overrides = { ...project.design.overrides, ...patch }
          }),

        resetOverrides: () =>
          commit((project) => {
            project.design.overrides = {}
          }),

        setDesign: (patch) =>
          commit((project) => {
            project.design = { ...project.design, ...patch }
          }),

        setLogo: (logoUrl) =>
          commit((project) => {
            project.logoUrl = logoUrl
          }),

        addSlide: (layout, index) => {
          const project = activeProject()
          if (!project) return
          const slide = buildSlide(layout)
          const insertAt = index ?? project.slides.length
          commit((draft) => {
            draft.slides.splice(insertAt, 0, slide)
          })
          set({ activeSlideId: slide.id, selectedBlockId: null, panelTab: 'content' })
        },

        updateSlideLayout: (slideId, layout) =>
          mutateSlide(slideId, (slide) => {
            slide.layout = layout
          }),

        deleteSlide: (slideId) => {
          const project = activeProject()
          if (!project) return
          const index = project.slides.findIndex((slide) => slide.id === slideId)
          commit((draft) => {
            draft.slides = draft.slides.filter((slide) => slide.id !== slideId)
          })
          const nextSlides = get().projects[project.id].slides
          const nextActive = nextSlides[Math.min(index, nextSlides.length - 1)]
          set({ activeSlideId: nextActive?.id ?? null, selectedBlockId: null })
        },

        duplicateSlide: (slideId) => {
          const project = activeProject()
          if (!project) return
          const index = project.slides.findIndex((slide) => slide.id === slideId)
          if (index < 0) return
          const copy: Slide = {
            ...structuredClone(project.slides[index]),
            id: newId('sld'),
            blocks: project.slides[index].blocks.map((block) => ({ ...structuredClone(block), id: newId('blk') })),
          }
          commit((draft) => {
            draft.slides.splice(index + 1, 0, copy)
          })
          set({ activeSlideId: copy.id, selectedBlockId: null })
        },

        moveSlide: (from, to) => {
          const project = activeProject()
          if (!project) return
          const slides = [...project.slides]
          if (from < 0 || to < 0 || from >= slides.length || to >= slides.length || from === to) return
          const [moved] = slides.splice(from, 1)
          slides.splice(to, 0, moved)
          commit((draft) => {
            draft.slides = slides
          })
          set({ activeSlideId: moved.id })
        },

        addBlock: (slideId, type) => {
          const project = activeProject()
          if (!project) return
          const block = createBlock(type)
          mutateSlide(slideId, (slide) => {
            slide.blocks.push(block)
          })
          set({ selectedBlockId: block.id, panelTab: 'content' })
        },

        updateBlock: (slideId, blockId, patch) =>
          mutateSlide(slideId, (slide) => {
            const block = slide.blocks.find((item) => item.id === blockId)
            if (block) Object.assign(block, patch)
          }),

        deleteBlock: (slideId, blockId) => {
          mutateSlide(slideId, (slide) => {
            slide.blocks = slide.blocks.filter((block) => block.id !== blockId)
          })
          if (get().selectedBlockId === blockId) set({ selectedBlockId: null })
        },

        moveBlock: (slideId, blockId, direction) =>
          mutateSlide(slideId, (slide) => {
            const index = slide.blocks.findIndex((block) => block.id === blockId)
            const target = index + direction
            if (index < 0 || target < 0 || target >= slide.blocks.length) return
            const [moved] = slide.blocks.splice(index, 1)
            slide.blocks.splice(target, 0, moved)
          }),

        replaceSlide: (slideId, next) =>
          mutateSlide(slideId, (slide) => {
            slide.blocks = next.blocks.map((block: Block) => ({ ...block, id: newId('blk') }))
          }),

        selectSlide: (slideId) => set({ activeSlideId: slideId, selectedBlockId: null }),
        selectBlock: (blockId) => set({ selectedBlockId: blockId }),
        setPanelTab: (tab) => set({ panelTab: tab }),
        setZoom: (zoom) => set({ zoom }),

        undo: () => {
          const { activeProjectId, past, future, projects } = get()
          if (!activeProjectId) return
          const previous = past[past.length - 1]
          const current = projects[activeProjectId]
          if (!previous || !current) return
          set({
            projects: { ...projects, [activeProjectId]: previous },
            past: past.slice(0, -1),
            future: [structuredClone(current), ...future].slice(0, HISTORY_LIMIT),
          })
        },

        redo: () => {
          const { activeProjectId, past, future, projects } = get()
          if (!activeProjectId) return
          const next = future[0]
          const current = projects[activeProjectId]
          if (!next || !current) return
          set({
            projects: { ...projects, [activeProjectId]: next },
            past: [...past, structuredClone(current)].slice(-HISTORY_LIMIT),
            future: future.slice(1),
          })
        },
      }
    },
    {
      name: 'carousel-studio.v1',
      partialize: (state) => ({
        projects: state.projects,
        order: state.order,
        appTheme: state.appTheme,
      }),
    },
  ),
)

// Selectors keep components from subscribing to the whole store.
export const useActiveProject = (): Project | undefined =>
  useAppStore((state) => (state.activeProjectId ? state.projects[state.activeProjectId] : undefined))

export const useActiveSlide = (): Slide | undefined => {
  const project = useActiveProject()
  const activeSlideId = useAppStore((state) => state.activeSlideId)
  return project?.slides.find((slide) => slide.id === activeSlideId)
}
