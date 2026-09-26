import {
  BarChart3,
  Heading1,
  Image as ImageIcon,
  Info,
  List,
  MousePointerClick,
  Quote,
  Scale,
  Sparkles,
  Type,
  type LucideIcon,
} from 'lucide-react'

import { newId } from './ids'
import type { Block, BlockType, LayoutId } from './types'

export const BLOCK_TYPES: BlockType[] = [
  'heading',
  'paragraph',
  'quote',
  'list',
  'image',
  'icon',
  'statistic',
  'comparison',
  'callout',
  'cta',
]

export const BLOCK_META: Record<BlockType, { label: string; hint: string; icon: LucideIcon }> = {
  heading: { label: 'Heading', hint: 'A single strong line', icon: Heading1 },
  paragraph: { label: 'Paragraph', hint: 'Supporting copy', icon: Type },
  quote: { label: 'Quote', hint: 'Pull quote with attribution', icon: Quote },
  list: { label: 'List', hint: 'Bullets or numbered points', icon: List },
  image: { label: 'Image', hint: 'Upload or link an image', icon: ImageIcon },
  icon: { label: 'Icon', hint: 'A visual accent', icon: Sparkles },
  statistic: { label: 'Statistic', hint: 'One number worth pausing on', icon: BarChart3 },
  comparison: { label: 'Comparison', hint: 'This versus that', icon: Scale },
  callout: { label: 'Callout', hint: 'Highlight one idea', icon: Info },
  cta: { label: 'Call to action', hint: 'Ask for the next step', icon: MousePointerClick },
}

/** Factories keep new blocks valid, so the renderer never sees malformed data. */
export function createBlock(type: BlockType): Block {
  const id = newId('blk')
  switch (type) {
    case 'heading':
      return { id, type, text: 'A clear, specific headline' }
    case 'paragraph':
      return { id, type, text: 'Add one or two sentences that earn the next swipe.' }
    case 'quote':
      return { id, type, text: 'The line you want people to remember.', attribution: 'Attribution' }
    case 'list':
      return { id, type, items: ['First point', 'Second point', 'Third point'], ordered: true }
    case 'image':
      return { id, type, fit: 'cover', alt: '' }
    case 'icon':
      return { id, type, icon: 'sparkles' }
    case 'statistic':
      return { id, type, value: '87%', label: 'of the impact came from one change', caption: 'Short context' }
    case 'comparison':
      return {
        id,
        type,
        leftLabel: 'What most people do',
        rightLabel: 'What actually works',
        leftItems: ['Play it safe', 'Wait for perfect', 'Add more features'],
        rightItems: ['Ship the rough version', 'Ask ten users', 'Cut until it is obvious'],
      }
    case 'callout':
      return { id, type, text: 'The one thing to remember from this slide.', tone: 'info' }
    case 'cta':
      return { id, type, text: 'Follow for more', subtext: 'Save this post and share it with someone who needs it.' }
  }
}

const LAYOUT_SEEDS: Record<LayoutId, () => Block[]> = {
  cover: () => [
    { id: newId('blk'), type: 'icon', icon: 'sparkles' },
    { id: newId('blk'), type: 'heading', text: 'Your big idea, stated plainly' },
    { id: newId('blk'), type: 'paragraph', text: 'One line that makes the next slide irresistible.' },
  ],
  statement: () => [{ id: newId('blk'), type: 'heading', text: 'One sentence worth stopping for' }],
  body: () => [
    { id: newId('blk'), type: 'heading', text: 'The point of this slide' },
    { id: newId('blk'), type: 'paragraph', text: 'Explain it the way you would to a friend over coffee.' },
  ],
  list: () => [
    { id: newId('blk'), type: 'heading', text: 'Key takeaways' },
    {
      id: newId('blk'),
      type: 'list',
      ordered: true,
      items: ['The first idea worth stealing', 'The second, slightly harder one', 'The third that changes the game'],
    },
  ],
  quote: () => [
    {
      id: newId('blk'),
      type: 'quote',
      text: 'A sentence that says what everyone is thinking.',
      attribution: '— Someone worth quoting',
    },
  ],
  stat: () => [
    {
      id: newId('blk'),
      type: 'statistic',
      value: '3×',
      label: 'more engagement on the simplest slide',
      caption: 'Measured, not guessed.',
    },
  ],
  compare: () => [
    { id: newId('blk'), type: 'heading', text: 'Before and after' },
    {
      id: newId('blk'),
      type: 'comparison',
      leftLabel: 'What most people do',
      rightLabel: 'What actually works',
      leftItems: ['Play it safe', 'Wait for perfect'],
      rightItems: ['Ship the rough version', 'Ask ten users'],
    },
  ],
  callout: () => [
    { id: newId('blk'), type: 'callout', text: 'The one thing to remember from this slide.', tone: 'info' },
  ],
  cta: () => [
    { id: newId('blk'), type: 'cta', text: 'Follow for more', subtext: 'Save this and pass it on.' },
  ],
}

export function createSlide(layout: LayoutId) {
  return { id: newId('sld'), layout, blocks: LAYOUT_SEEDS[layout]() }
}

/** The primary text of a block — used by inline editing and the AI actions. */
export function getBlockText(block: Block): string | undefined {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'callout':
    case 'cta':
    case 'quote':
      return block.text
    default:
      return undefined
  }
}

export function withBlockText(block: Block, text: string): Block {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'quote':
    case 'callout':
    case 'cta':
      return { ...block, text }
    default:
      return block
  }
}
