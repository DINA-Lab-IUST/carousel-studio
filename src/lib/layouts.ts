import type { BlockType, LayoutId } from './types'

export interface LayoutDef {
  id: LayoutId
  label: string
  hint: string
  /** Block types this layout is designed around, in reading order. */
  suggested: BlockType[]
  align: 'left' | 'center'
  justify: 'start' | 'center'
}

/**
 * Layouts only describe arrangement. Switching a slide's layout keeps its
 * blocks untouched, so no work is ever lost.
 */
export const LAYOUTS: LayoutDef[] = [
  {
    id: 'cover',
    label: 'Cover',
    hint: 'Opening slide with a hook',
    suggested: ['icon', 'heading', 'paragraph'],
    align: 'left',
    justify: 'center',
  },
  {
    id: 'statement',
    label: 'Statement',
    hint: 'One big idea, centered',
    suggested: ['heading'],
    align: 'center',
    justify: 'center',
  },
  {
    id: 'body',
    label: 'Text',
    hint: 'Heading plus supporting copy',
    suggested: ['heading', 'paragraph'],
    align: 'left',
    justify: 'start',
  },
  {
    id: 'list',
    label: 'List',
    hint: 'Numbered points or takeaways',
    suggested: ['heading', 'list'],
    align: 'left',
    justify: 'start',
  },
  {
    id: 'quote',
    label: 'Quote',
    hint: 'Pull quote with attribution',
    suggested: ['quote'],
    align: 'center',
    justify: 'center',
  },
  {
    id: 'stat',
    label: 'Statistic',
    hint: 'One number, front and center',
    suggested: ['statistic'],
    align: 'center',
    justify: 'center',
  },
  {
    id: 'compare',
    label: 'Comparison',
    hint: 'Two columns of contrast',
    suggested: ['heading', 'comparison'],
    align: 'left',
    justify: 'start',
  },
  {
    id: 'callout',
    label: 'Callout',
    hint: 'A single highlighted thought',
    suggested: ['callout'],
    align: 'center',
    justify: 'center',
  },
  {
    id: 'cta',
    label: 'Call to action',
    hint: 'Closing slide asking for a response',
    suggested: ['cta'],
    align: 'center',
    justify: 'center',
  },
]

export const LAYOUT_MAP: Record<LayoutId, LayoutDef> = LAYOUTS.reduce(
  (acc, layout) => ({ ...acc, [layout.id]: layout }),
  {} as Record<LayoutId, LayoutDef>,
)

export const LAYOUT_IDS: LayoutId[] = LAYOUTS.map((layout) => layout.id)

export function getLayout(id: LayoutId): LayoutDef {
  return LAYOUT_MAP[id] ?? LAYOUT_MAP.body
}
