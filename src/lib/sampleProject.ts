import { newId } from './ids'
import { createProject } from './project'
import type { Block, LayoutId, Project, Slide } from './types'

export const SAMPLE_PROJECT_ID = 'sample-side-project'

function slide(layout: LayoutId, blocks: Block[]): Slide {
  return { id: newId('sld'), layout, blocks }
}

/**
 * Seeded on first run so the product feels real immediately: a finished,
 * honest carousel someone would actually post.
 */
export function createSampleProject(): Project {
  const slides: Slide[] = [
    slide('cover', [
      { id: newId('blk'), type: 'icon', icon: 'rocket' },
      { id: newId('blk'), type: 'heading', text: '7 lessons from shipping my side project' },
      {
        id: newId('blk'),
        type: 'paragraph',
        text: 'Two years of nights and weekends, distilled into the parts that actually moved the needle.',
      },
    ]),
    slide('body', [
      { id: newId('blk'), type: 'heading', text: '1. Ship before you feel ready' },
      {
        id: newId('blk'),
        type: 'paragraph',
        text: 'I waited fourteen months for a version I was proud of. The first fifty users taught me more in two weeks than that whole year of building.',
      },
    ]),
    slide('list', [
      { id: newId('blk'), type: 'heading', text: 'What I would do differently' },
      {
        id: newId('blk'),
        type: 'list',
        ordered: true,
        items: [
          'Talk to ten users before writing code',
          'Put up a landing page in week one',
          'Charge from day one — free users hide the truth',
          'Keep the roadmap to one outcome a month',
        ],
      },
    ]),
    slide('quote', [
      {
        id: newId('blk'),
        type: 'quote',
        text: 'The version you are embarrassed to ship is the version people actually learn from.',
        attribution: '— Every solo builder, eventually',
      },
    ]),
    slide('stat', [
      { id: newId('blk'), type: 'statistic', value: '3×', label: 'more signups after rewriting the copy', caption: 'Same product. Different words.' },
    ]),
    slide('compare', [
      { id: newId('blk'), type: 'heading', text: 'What I built vs. what mattered' },
      {
        id: newId('blk'),
        type: 'comparison',
        leftLabel: 'Where my time went',
        rightLabel: 'What actually moved it',
        leftItems: ['Team accounts', 'Custom themes', 'Analytics dashboard'],
        rightItems: ['One clear landing page', 'One painful problem solved', 'A way to get paid'],
      },
    ]),
    slide('body', [
      { id: newId('blk'), type: 'heading', text: 'Distribution is the product' },
      {
        id: newId('blk'),
        type: 'paragraph',
        text: 'I spent ninety percent of my time on features and ten percent on writing. That ratio was backwards — the posts I almost did not publish drove most of the traffic.',
      },
    ]),
    slide('cta', [
      {
        id: newId('blk'),
        type: 'cta',
        text: 'Build in public — the feedback is the shortcut',
        subtext: 'Follow for more notes from the messy middle of building.',
      },
    ]),
  ]

  const project = createProject({
    title: '7 lessons from shipping a side project',
    slides,
    platformId: 'linkedin-portrait',
    themeId: 'modern-tech',
    kicker: 'BUILDING IN PUBLIC',
  })

  // A filled-in author so the outro card is discoverable on first run.
  return {
    ...project,
    id: SAMPLE_PROJECT_ID,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    design: {
      ...project.design,
      showAuthor: true,
      showOutroSlide: true,
      author: {
        name: 'Alex Rivera',
        role: 'Frontend Engineer',
        handle: '@alexbuilds',
        socials: { github: 'github.com/alexbuilds', linkedin: 'in/alexrivera', website: 'alexbuilds.dev' },
      },
    },
  }

}
