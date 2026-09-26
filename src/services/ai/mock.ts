import { newId } from '../../lib/ids'
import type { CarouselOutline, OutlineSlide } from '../../lib/outline'
import type { Block, LayoutId, Slide } from '../../lib/types'
import { clamp, firstSentence, hashString, pick, pickMany, seededRandom, truncate, wait } from '../../lib/utils'
import type { AIService, TextTweakMode } from './types'

// ---------------------------------------------------------------------------
// Content banks — the mock still has to sound like a real assistant.
// ---------------------------------------------------------------------------

const HOOK_LINES = [
  'Most people get this wrong. Here is what actually worked for me.',
  'I learned this the hard way so you can skip the expensive part.',
  'No fluff — just the parts that moved the needle.',
  'Steal this framework. It took me two years to arrive at it.',
  'The honest version nobody puts on a slide.',
  'Seven minutes of reading that will save you seven months.',
]

const DETAIL_LINES = [
  'This is the part of {t} people skip, and it is exactly where the results hide.',
  'It sounds obvious until you try it for a week — then it stops being obvious.',
  'Once this clicked, {t} stopped feeling like guesswork.',
  'Small change, outsized effect. The kind of thing you only notice in hindsight.',
  'I resisted this one for months. That was the expensive mistake.',
  'No new tools required — just a different default.',
]

const ANGLES = {
  principles: {
    heading: 'Principles I keep coming back to',
    points: [
      'Start before you feel ready',
      'Clarity beats cleverness',
      'Consistency outperforms intensity',
      'Feedback is faster than planning',
      'Ship small, ship often',
      'Cut the idea until it is obvious',
      'Distribution is part of the product',
    ],
  },
  mistakes: {
    heading: 'Mistakes that cost me the most time',
    points: [
      'Waiting for the perfect version',
      'Building before talking to anyone',
      'Confusing motion with progress',
      'Optimizing what nobody noticed',
      'Adding features instead of answers',
      'Keeping the plan when the data disagreed',
      'Hiding the work until it was polished',
    ],
  },
  steps: {
    heading: 'The short version, in order',
    points: [
      'Write the one-sentence promise',
      'Talk to five people who feel the pain',
      'Build the smallest testable version',
      'Put it in front of real users this week',
      'Measure the one number that matters',
      'Double down on what gets reactions',
      'Repeat with the next smallest bet',
    ],
  },
} as const

const LIST_HEADINGS = [
  'What I would do differently',
  'The shortlist that actually matters',
  'Rules I build by now',
  'Lessons worth stealing',
]

const STAT_BANK = [
  { value: '3×', label: 'faster iteration after cutting the scope in half', caption: 'Same team, same tools.' },
  { value: '87%', label: 'of the value came from the first three attempts', caption: 'The last 13% took twice as long.' },
  { value: '10×', label: 'more reach from one honest post than ten polished ones', caption: 'Distribution is a skill.' },
  { value: '5 min', label: 'a day is enough to keep the momentum alive', caption: 'Consistency beats intensity.' },
]

const QUOTE_BANK = [
  { text: 'Done is better than perfect — but done and honest beats both.', attribution: '— Every builder, eventually' },
  { text: 'The market tells you the truth. Your roadmap tells you a story.', attribution: '— A lesson, not a slogan' },
  { text: 'Simplicity is not the absence of ideas. It is the clarity of one.', attribution: '— Worth remembering' },
]

const COMPARE_BANK = [
  {
    heading: 'What I optimized for vs. what mattered',
    leftLabel: 'Where my time went',
    rightLabel: 'What actually moved it',
    leftItems: ['Team accounts', 'Custom themes', 'Analytics dashboard'],
    rightItems: ['A clear landing page', 'One painful problem solved', 'A way to pay you'],
  },
  {
    heading: 'The instinct vs. the practice',
    leftLabel: 'Default instinct',
    rightLabel: 'Better practice',
    leftItems: ['Add another feature', 'Rewrite the plan', 'Wait for feedback to arrive'],
    rightItems: ['Fix the first confusing sentence', 'Ship the smaller version', 'Ask five people directly'],
  },
]

const CTA_BANK = [
  { text: 'Follow for more practical breakdowns', subtext: 'Save this post and share it with someone who needs it.' },
  { text: 'Found this useful? Pass it on', subtext: 'Repost it so it lands on someone else’s feed.' },
  { text: 'Which one are you trying first?', subtext: 'Drop it in the comments — I read every one.' },
]

const CTA_VARIANTS = [
  'Found this useful? Repost it so it reaches someone who needs it today.',
  'Follow for weekly, no-fluff breakdowns like this one.',
  'Save this for the next time you are stuck — future you will be grateful.',
  'Which point hit hardest? Tell me in the comments 👇',
]

const HOOK_TEMPLATES = [
  'Nobody talks about the boring middle of {t}.',
  'I spent two years learning {t} the slow way.',
  '{t}: the things I wish I had known sooner.',
  'Stop overcomplicating {t}.',
  'The fastest way to get better at {t} is unglamorous.',
  'Everything you have been told about {t} is half true.',
  'A 60-second framework for {t}.',
  '{t} broke me. Then it started working.',
]

const EXPANSION_LINES = [
  'The result is fewer dead ends and much faster feedback.',
  'It compounds quietly, which is why most people quit before it shows up.',
  'Try it for one week and notice how much calmer the work feels.',
  'No new tools required — just a different default.',
]

const REWRITE_PATTERNS: ((value: string) => string)[] = [
  (value) => `The short version: ${value}`,
  (value) => `${value} No caveats.`,
  (value) => `The part nobody says out loud: ${value}`,
  (value) => `Contrarian but true: ${value}`,
  (value) => `Here is the honest take: ${value}`,
]

const FILLERS = /\b(basically|actually|really|very|literally|simply|just|quite|somewhat)\s+/gi

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function coverHeading(idea: string): string {
  const value = clean(idea)
  if (!value) return 'Turn one idea into a carousel worth reading'
  const sentence = firstSentence(value).replace(/[.!?]+$/, '')
  return truncate(sentence, 78)
}

function topicOf(idea: string): string {
  const words = clean(idea).split(' ').filter(Boolean)
  const core = words.slice(0, 7).join(' ').replace(/[.,;:!?]+$/, '')
  return (core || 'your topic').toLowerCase()
}

function fill(template: string, topic: string): string {
  return template.replaceAll('{t}', topic)
}

function stripFillers(text: string): string {
  return clean(text.replace(FILLERS, '')).replace(/\s+([.,;:!?])/g, '$1')
}

function shortenText(text: string): string {
  const tight = stripFillers(firstSentence(text))
  return truncate(tight, 110)
}

function expandText(text: string, rnd: () => number): string {
  const base = clean(text)
  return `${base} ${pick(EXPANSION_LINES, rnd)}`
}

function rewriteText(text: string, rnd: () => number): string {
  const tight = stripFillers(firstSentence(text)).replace(/[.!?]+$/, '')
  const pattern = pick(REWRITE_PATTERNS, rnd)
  return pattern(tight)
}

function statBlock(rnd: () => number): Block {
  const stat = pick(STAT_BANK, rnd)
  return { id: newId('blk'), type: 'statistic', value: stat.value, label: stat.label, caption: stat.caption }
}

function quoteBlock(rnd: () => number): Block {
  const quote = pick(QUOTE_BANK, rnd)
  return { id: newId('blk'), type: 'quote', text: quote.text, attribution: quote.attribution }
}

function listBlock(points: readonly string[], rnd: () => number, ordered = true): Block {
  return { id: newId('blk'), type: 'list', ordered, items: pickMany(points, 4, rnd) }
}

function comparisonBlock(rnd: () => number): Block {
  const compare = pick(COMPARE_BANK, rnd)
  return {
    id: newId('blk'),
    type: 'comparison',
    leftLabel: compare.leftLabel,
    rightLabel: compare.rightLabel,
    leftItems: [...compare.leftItems],
    rightItems: [...compare.rightItems],
  }
}

function bodySlide(point: string, index: number, topic: string, rnd: () => number): OutlineSlide {
  return {
    layout: 'body',
    blocks: [
      { id: newId('blk'), type: 'heading', text: `${index}. ${point}` },
      { id: newId('blk'), type: 'paragraph', text: fill(pick(DETAIL_LINES, rnd), topic) },
    ],
  }
}

function slideForLayout(
  layout: LayoutId,
  point: string,
  index: number,
  angle: (typeof ANGLES)[keyof typeof ANGLES],
  topic: string,
  rnd: () => number,
): OutlineSlide {
  switch (layout) {
    case 'list':
      return {
        layout: 'list',
        blocks: [
          { id: newId('blk'), type: 'heading', text: pick(LIST_HEADINGS, rnd) },
          listBlock(angle.points, rnd),
        ],
      }
    case 'stat':
      return {
        layout: 'stat',
        blocks: [
          { id: newId('blk'), type: 'heading', text: 'One number worth pausing on', align: 'center' },
          statBlock(rnd),
        ],
      }
    case 'quote':
      return { layout: 'quote', blocks: [quoteBlock(rnd)] }
    case 'compare':
      return {
        layout: 'compare',
        blocks: [
          { id: newId('blk'), type: 'heading', text: 'The instinct vs. the practice' },
          comparisonBlock(rnd),
        ],
      }
    case 'callout':
      return { layout: 'callout', blocks: [{ id: newId('blk'), type: 'callout', text: fill(pick(DETAIL_LINES, rnd), topic), tone: 'info' }] }
    default:
      return bodySlide(point, index, topic, rnd)
  }
}

const ANGLE_KEYS = ['principles', 'mistakes', 'steps'] as const

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const MIN_DELAY = 380
const MAX_DELAY = 780

/**
 * MockAIService returns realistic, deterministic-per-input structured content.
 * Every method resolves to document data — never HTML or UI instructions — so a
 * real provider can replace it without touching the editor.
 */
export class MockAIService implements AIService {
  private delay(rnd: () => number): Promise<void> {
    return wait(MIN_DELAY + rnd() * (MAX_DELAY - MIN_DELAY))
  }

  async generateOutline({ idea, slideCount }: { idea: string; slideCount: number }): Promise<CarouselOutline> {
    const total = clamp(slideCount, 4, 10)
    const rnd = seededRandom(hashString(idea) + total)
    await this.delay(rnd)

    const angle = ANGLES[pick(ANGLE_KEYS, rnd)]
    const topic = topicOf(idea)
    const title = coverHeading(idea)

    const slides: OutlineSlide[] = [
      {
        layout: 'cover',
        blocks: [
          { id: newId('blk'), type: 'icon', icon: pick(['sparkles', 'rocket', 'lightbulb', 'target', 'trending'], rnd) },
          { id: newId('blk'), type: 'heading', text: title },
          { id: newId('blk'), type: 'paragraph', text: pick(HOOK_LINES, rnd) },
        ],
      },
    ]

    const bodyCount = Math.max(1, total - 2)
    const specials: LayoutId[] = []
    if (bodyCount >= 3) specials.push('list')
    if (bodyCount >= 4) specials.push('stat')
    if (bodyCount >= 5) specials.push('quote')
    if (bodyCount >= 6) specials.push('compare')

    const plan: LayoutId[] = new Array<LayoutId>(bodyCount).fill('body')
    specials.slice(0, Math.max(0, bodyCount - 1)).forEach((layout, i) => {
      const slot = 1 + i * 2
      if (slot < bodyCount) plan[slot] = layout
    })

    plan.forEach((layout, index) => {
      const point = angle.points[index % angle.points.length]
      slides.push(slideForLayout(layout, point, index + 1, angle, topic, rnd))
    })

    slides.push({
      layout: 'cta',
      blocks: [
        { id: newId('blk'), type: 'cta', text: pick(['Follow for more', 'Save this one', 'Which one will you try?'], rnd), subtext: pick(CTA_BANK, rnd).subtext },
      ],
    })

    return { title, slides }
  }

  async splitContent({ text }: { text: string }): Promise<CarouselOutline> {
    const rnd = seededRandom(hashString(text))
    await this.delay(rnd)

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)

    if (paragraphs.length === 0) {
      return this.generateOutline({ idea: 'A short idea worth sharing', slideCount: 5 })
    }

    const topic = topicOf(paragraphs[0])
    const title = coverHeading(paragraphs[0])
    const slides: OutlineSlide[] = []

    const coverBody = clean(paragraphs[0]).slice(title.replace(/…$/, '').length).trim()
    slides.push({
      layout: 'cover',
      blocks: [
        { id: newId('blk'), type: 'icon', icon: 'lightbulb' },
        { id: newId('blk'), type: 'heading', text: title },
        {
          id: newId('blk'),
          type: 'paragraph',
          text: coverBody.length > 20 ? truncate(coverBody.replace(/^[-–—:.\s]+/, ''), 130) : pick(HOOK_LINES, rnd),
        },
      ],
    })

    paragraphs.slice(1).forEach((paragraph) => {
      if (slides.length >= 12) return
      const lines = paragraph
        .split('\n')
        .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
        .filter(Boolean)

      const bulletish = lines.length >= 3 && lines.every((line) => line.length < 90)
      const short = clean(paragraph).length < 150

      if (bulletish) {
        slides.push({
          layout: 'list',
          blocks: [
            { id: newId('blk'), type: 'heading', text: pick(LIST_HEADINGS, rnd) },
            { id: newId('blk'), type: 'list', ordered: true, items: lines.slice(0, 6) },
          ],
        })
      } else if (short) {
        slides.push({ layout: 'statement', blocks: [{ id: newId('blk'), type: 'heading', text: truncate(clean(paragraph), 96) }] })
      } else {
        slides.push({
          layout: 'body',
          blocks: [
            { id: newId('blk'), type: 'heading', text: truncate(firstSentence(paragraph), 72) },
            { id: newId('blk'), type: 'paragraph', text: truncate(clean(paragraph), 240) },
          ],
        })
      }
    })

    slides.push({
      layout: 'cta',
      blocks: [
        { id: newId('blk'), type: 'cta', text: 'Found this useful? Pass it on', subtext: 'Repost it so it lands on someone else’s feed.' },
      ],
    })

    void topic
    return { title, slides }
  }

  async tweakText({ text, mode }: { text: string; mode: TextTweakMode }): Promise<string> {
    const rnd = seededRandom(hashString(`${mode}:${text}`))
    await this.delay(rnd)
    if (mode === 'shorten') return shortenText(text)
    if (mode === 'expand') return expandText(text, rnd)
    return rewriteText(text, rnd)
  }

  async generateHooks({ topic }: { topic: string }): Promise<string[]> {
    const rnd = seededRandom(hashString(`hooks:${topic}`))
    await this.delay(rnd)
    const subject = topicOf(topic)
    const hooks = pickMany(HOOK_TEMPLATES, 5, rnd).map((template) => fill(template, subject))
    if (hooks.length < 5) hooks.push(fill(HOOK_TEMPLATES[0], subject))
    return hooks
  }

  async improveCta({ text }: { text: string }): Promise<string[]> {
    const rnd = seededRandom(hashString(`cta:${text}`))
    await this.delay(rnd)
    const original = clean(text)
    const variants = pickMany(CTA_VARIANTS, 3, rnd)
    if (original) variants.unshift(rewriteText(original, rnd))
    return variants
  }

  async regenerateSlide({ slide, projectTitle }: { slide: Slide; projectTitle: string }): Promise<Slide> {
    const rnd = seededRandom(hashString(`${slide.id}:${projectTitle}:${slide.blocks.length}`) + Date.now() % 9973)
    await this.delay(rnd)

    const angle = ANGLES[pick(ANGLE_KEYS, rnd)]
    const topic = topicOf(projectTitle)
    const point = pick(angle.points, rnd)
    const draft = slideForLayout(slide.layout, point, slide.blocks.length + 1, angle, topic, rnd)

    return { ...slide, blocks: draft.blocks }
  }
}
