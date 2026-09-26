import { newId } from './ids'
import type { Block, LayoutId, Slide } from './types'

export interface OutlineSlide {
  layout: LayoutId
  blocks: Block[]
}

export interface CarouselOutline {
  title: string
  slides: OutlineSlide[]
}

/** Pure mapping so generated outlines can be tested without any UI. */
export function outlineToSlides(outline: CarouselOutline): Slide[] {
  return outline.slides.map((slide) => ({
    id: newId('sld'),
    layout: slide.layout,
    blocks: slide.blocks.map((block) => ({ ...block, id: newId('blk') })),
  }))
}
