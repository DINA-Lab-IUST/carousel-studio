import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { createBlock, createSlide } from '../../lib/blocks'
import { CODE_LOGOS } from '../../lib/codeLogos'
import { newId } from '../../lib/ids'
import { getTheme, THEMES } from '../../lib/themes'
import type { Block, CodeLanguage, Project, TextDirection, ThemeTokens } from '../../lib/types'
import { BlockRenderer } from './BlockRenderer'
import { SlideView } from './SlideView'

const tokens = THEMES[0].tokens as ThemeTokens

function render(block: Block, interactive = false, direction: TextDirection = 'ltr') {
  return renderToStaticMarkup(
    <BlockRenderer
      block={block}
      tokens={tokens}
      unit={1}
      variant="body"
      centered={false}
      direction={direction}
      interactive={interactive}
    />,
  )
}

describe('BlockRenderer code block', () => {
  it('paints the editor window chrome and highlighted tokens', () => {
    const html = render(createBlock('code'))
    expect(html).toContain('App.tsx')
    expect(html).toContain('background:#ff5f56')
    expect(html).toContain('color:#98c379')
  })

  it('renders a terminal session with prompts and output', () => {
    const block = createBlock('code') as Extract<Block, { type: 'code' }>
    const html = render({ ...block, mode: 'terminal', code: '~/app $ npm run dev\nerror: build failed' })
    expect(html).toContain('color:#7ee787')
    expect(html).toContain('color:#f07178')
  })

  it('stays highlighted while the canvas is interactive', () => {
    const html = render(createBlock('code'), true)
    // The code body is a picture of the syntax; editing lives in the panel.
    expect(html).toContain('color:#98c379')
    expect(html).toContain('contentEditable="true"')
  })

  it('paints the language mark in the tab', () => {
    expect(render(createBlock('code'))).toContain('viewBox="0 0 24 24"')
  })

  it('uses the official brand vectors, not placeholders', () => {
    const of = (language: CodeLanguage) =>
      render({ ...(createBlock('code') as Extract<Block, { type: 'code' }>), language })
    // Brand hexes straight from simple-icons / MDI.
    expect(of('typescript')).toContain('fill="#3178C6"')
    expect(of('javascript')).toContain('fill="#F7DF1E"')
    expect(of('python')).toContain('fill="#387eb8"')
    expect(of('python')).toContain('fill="#ffd43b"')
    expect(of('java')).toContain('fill="#5382a1"')
    expect(of('java')).toContain('fill="#e76f00"')
    expect(of('csharp')).toContain('fill="#68217a"')
    expect(of('cpp')).toContain('fill="#00599c"')
    expect(of('go')).toContain('fill="#00add8"')
    expect(of('html')).toContain('fill="#E34F26"')
    expect(of('css')).toContain('fill="#264de4"')
    expect(of('bash')).toContain('fill="#4EAA25"')
    expect(of('sql')).toContain('fill="#0f766e"')
  })

  it('draws nothing but the glyph: no backdrop, no container, no white box', () => {
    for (const language of Object.keys(CODE_LOGOS) as CodeLanguage[]) {
      const html = render({ ...(createBlock('code') as Extract<Block, { type: 'code' }>), language })
      // Scope to the mark itself; the window chrome around it has its own radii.
      const svg = html.slice(html.indexOf('<svg'), html.indexOf('</svg>'))
      expect(svg.length, language).toBeGreaterThan(0)
      // No background geometry of any kind, and nothing that paints a plate.
      expect(svg, language).not.toContain('<rect')
      expect(svg, language).not.toContain('<circle')
      expect(svg, language).not.toContain('<polygon')
      expect(svg, language).not.toMatch(/fill="(#fff(fff)?|white)"/)
      expect(svg, language).not.toContain('background')
      expect(svg, language).not.toContain('border')
      // A transparent canvas whose only paint is the brand path.
      expect(svg, language).toContain('fill="none"')
      expect((svg.match(/<path/g) ?? []).length, language).toBeGreaterThan(0)
    }
  })

  it('leaves the tab wrapper transparent', () => {
    const html = render(createBlock('code'))
    expect(html).toContain('background:transparent;border:none;padding:0')
  })

  it('keeps black glyphs legible on either window', () => {
    const rust = createBlock('code') as Extract<Block, { type: 'code' }>
    const dark = render({ ...rust, language: 'rust' }, false, 'ltr')
    const light = render({ ...rust, language: 'rust', themeVariant: 'light' }, false, 'ltr')
    // Rust's gear is pure black, so it flips to a light ink on dark chrome.
    expect(dark).toContain('fill="#e4e4e7"')
    expect(light).toContain('fill="#000000"')
  })

  it('keeps every mark a self-contained inline svg', () => {
    for (const language of Object.keys(CODE_LOGOS) as CodeLanguage[]) {
      const html = render({ ...(createBlock('code') as Extract<Block, { type: 'code' }>), language })
      expect(html).toContain('<svg')
      expect(html).not.toContain('<image')
      expect(html).not.toContain('http')
      expect(html).not.toContain('xlink:href')
    }
  })
})

describe('code isolation from RTL slides', () => {
  const persian = getTheme('persian-tech')

  function renderPersianCode(mode: 'editor' | 'terminal', interactive = false) {
    const block = createBlock('code') as Extract<Block, { type: 'code' }>
    return renderToStaticMarkup(
      <BlockRenderer
        block={{ ...block, mode, code: mode === 'terminal' ? '$ npm run dev\nready' : block.code }}
        tokens={persian.tokens}
        unit={1}
        variant="body"
        centered={false}
        direction="rtl"
        interactive={interactive}
      />,
    )
  }

  it('pins direction, alignment and the code font on every layer', () => {
    for (const mode of ['editor', 'terminal'] as const) {
      const html = renderPersianCode(mode)
      expect(html).toContain('dir="ltr"')
      expect(html).toContain('direction:ltr')
      expect(html).toContain('text-align:left')
      expect(html).toContain('unicode-bidi:isolate')
      // Quotes are HTML-escaped in the serialized style attribute.
      expect(html).toContain('font-family:&#x27;Fira Code&#x27;')
    }
  })

  it('never pulls the Persian slide font into the window', () => {
    for (const mode of ['editor', 'terminal'] as const) {
      expect(renderPersianCode(mode)).not.toContain('Vazirmatn')
      expect(renderPersianCode(mode, true)).not.toContain('Vazirmatn')
    }
  })

  it('forces the editable snippet itself to ltr', () => {
    const html = renderPersianCode('editor', true)
    expect(html).toContain('dir="ltr"')
    expect(html).toContain('contentEditable="true"')
  })
})

describe('rtl slide canvas', () => {
  const project = {
    id: newId('prj'),
    title: 'معماری مدرن',
    createdAt: 0,
    updatedAt: 0,
    design: {
      themeId: 'persian-tech',
      overrides: {},
      platformId: 'linkedin-portrait' as const,
      kicker: 'مهندسی',
      showSlideNumbers: true,
      showLogo: false,
      direction: 'rtl' as const,
    },
    slides: [createSlide('body')],
  }

  it('runs the slide right-to-left and mirrors the progress bar', () => {
    const html = renderToStaticMarkup(<SlideView project={project} slide={project.slides[0]} index={0} total={3} />)
    expect(html).toContain('dir="rtl"')
    expect(html).toContain('direction:rtl')
    expect(html).toContain('left:auto;right:0')
  })

  it('numbers slides with Persian digits', () => {
    const html = renderToStaticMarkup(<SlideView project={project} slide={project.slides[0]} index={0} total={3} />)
    expect(html).toContain('۰۱ / ۰۳')
    expect(html).toMatch(/dir="rtl"[^>]*unicode-bidi:isolate[^>]*>۰۱/)
  })

  it('leaves an ltr project untouched', () => {
    const ltr = { ...project, design: { ...project.design, direction: 'ltr' as const } }
    const html = renderToStaticMarkup(<SlideView project={ltr} slide={ltr.slides[0]} index={0} total={3} />)
    expect(html).toContain('dir="ltr"')
    expect(html).not.toContain('direction:rtl')
    expect(html).toContain('01 / 03')
  })
})
describe('persian ordered lists', () => {
  const list = (): Block => ({ id: newId('blk'), type: 'list', ordered: true, items: ['اول', 'دوم', 'سوم'] })

  it('numbers with Persian digits when the slide is rtl', () => {
    const html = render(list(), false, 'rtl')
    expect(html).toContain('۱')
    expect(html).not.toMatch(/>1</)
  })

  it('keeps Latin digits when the slide is ltr', () => {
    expect(render(list())).toContain('>1<')
  })
})

describe('author and lab branding', () => {
  const base = {
    id: newId('prj'),
    title: 'معماری مدرن',
    createdAt: 0,
    updatedAt: 0,
    design: {
      themeId: 'persian-tech',
      overrides: {},
      platformId: 'linkedin-portrait' as const,
      kicker: '',
      showSlideNumbers: false,
      showLogo: false,
      direction: 'ltr' as const,
      showAuthor: true,
      author: { name: 'سارا احمدی', role: 'Senior Engineer', handle: '@sara', avatarUrl: 'data:image/png;base64,AA' },
      showLabBadge: true,
      labLogoUrl: 'data:image/png;base64,BB',
    },
    slides: [createSlide('cover'), createSlide('cta')],
  }

  const slideHtml = (index: number) =>
    renderToStaticMarkup(<SlideView project={base} slide={base.slides[index]} index={index} total={base.slides.length} />)

  it('puts a compact byline on the cover', () => {
    const html = slideHtml(0)
    expect(html).toContain('سارا احمدی')
    expect(html).toContain('@sara')
    expect(html).toContain('border-radius:999px')
  })

  it('puts the full card on the closing slide', () => {
    const html = slideHtml(1)
    expect(html).toContain('سارا احمدی')
    expect(html).toContain('Follow for more on this topic')
  })

  it('renders the lab emblem in the header', () => {
    expect(slideHtml(0)).toContain('data:image/png;base64,BB')
  })

  it('shows nothing when both are switched off', () => {
    const off = { ...base, design: { ...base.design, showAuthor: false, showLabBadge: false } }
    const html = renderToStaticMarkup(<SlideView project={off} slide={off.slides[0]} index={0} total={2} />)
    expect(html).not.toContain('سارا احمدی')
    expect(html).not.toContain('data:image/png;base64,BB')
  })
})

describe('rtl slide with branding and code together', () => {
  const project: Project = {
    id: newId('prj'),
    title: 'معماری مدرن',
    createdAt: 0,
    updatedAt: 0,
    design: {
      themeId: 'persian-tech',
      overrides: {},
      platformId: 'linkedin-portrait',
      kicker: 'مهندسی',
      showSlideNumbers: true,
      showLogo: false,
      direction: 'rtl',
      showAuthor: true,
      author: { name: 'سارا احمدی', role: 'مهندس نرم‌افزار', handle: '@sara' },
      showLabBadge: true,
      labLogoUrl: 'data:image/png;base64,LAB',
    },
    slides: [createSlide('cover'), createSlide('cta')],
  }

  const java: Block = {
    id: newId('blk'),
    type: 'code',
    mode: 'editor',
    language: 'java',
    filename: 'Main.java',
    code: 'public class Main {\n  // چاپ خروجی\n  public static void main(String[] args) {\n    System.out.println("سلام");\n  }\n}',
    showLineNumbers: true,
    themeVariant: 'dark',
  }

  it('keeps every layer happy at once', () => {
    const slide = { ...project.slides[1], blocks: [...project.slides[1].blocks, java] }
    const html = renderToStaticMarkup(<SlideView project={project} slide={slide} index={1} total={2} />)

    // Persian chrome.
    expect(html).toContain('data:image/png;base64,LAB')
    expect(html).toContain('سارا احمدی')
    expect(html).toContain('۰۲ / ۰۲')
    expect(html).toContain('Vazirmatn')

    // Java tokenization and the two-tone Java cup.
    expect(html).toContain('color:#98c379')
    expect(html).toContain('fill="#e76f00"')
    expect(html).toContain('fill="#5382a1"')
    expect(html).toContain('Main.java')

    // Code stays on Fira Code, never the Persian face.
    expect(html).toContain('font-family:&#x27;Fira Code&#x27;')
    expect(html).not.toContain('font-family:&#x27;Vazirmatn&#x27;, -apple-system, BlinkMacSystemFont, sans-serif;font-size:19px')
  })
})

describe('lab emblem', () => {
  const project = (design: Partial<Project['design']> = {}): Project => ({
    id: newId('prj'),
    title: 't',
    createdAt: 0,
    updatedAt: 0,
    design: {
      themeId: 'persian-tech',
      overrides: {},
      platformId: 'linkedin-portrait',
      kicker: '',
      showSlideNumbers: false,
      showLogo: false,
      direction: 'rtl',
      showLabBadge: true,
      labLogoUrl: 'data:image/png;base64,LAB',
      ...design,
    },
    slides: [createSlide('cover')],
  })

  const html = (p: Project) =>
    renderToStaticMarkup(<SlideView project={p} slide={p.slides[0]} index={0} total={1} />)

  it('crops into a circle with an accent ring', () => {
    const out = html(project())
    expect(out).toContain('border-radius:9999px')
    expect(out).toContain('object-fit:cover')
    expect(out).toContain('object-position:center')
    expect(out).toContain('overflow:hidden')
    // The ring is the accent, matching the theme rather than a flat border.
    expect(out).toContain('border:2px solid #2dd4bf')
  })

  it('hides the header when the toggle is off', () => {
    expect(html(project({ showLabBadge: false }))).not.toContain('data:image/png;base64,LAB')
  })

  it('falls back to the project logo when no lab emblem is set', () => {
    const p = project({ labLogoUrl: undefined, showLogo: true })
    p.logoUrl = 'data:image/png;base64,PROJ'
    expect(html(p)).not.toContain('data:image/png;base64,LAB')
  })
})

describe('outro card', () => {
  const socials = {
    linkedin: 'in/sara',
    github: 'github.com/sara',
    telegram: 't.me/sara',
    twitter: '@sara',
    email: 'sara@iust.ac.ir',
    website: 'sara.dev',
  }

  const project = (design: Partial<Project['design']> = {}): Project => ({
    id: newId('prj'),
    title: 't',
    createdAt: 0,
    updatedAt: 0,
    design: {
      themeId: 'persian-tech',
      overrides: {},
      platformId: 'linkedin-portrait',
      kicker: '',
      showSlideNumbers: true,
      showLogo: false,
      direction: 'rtl',
      showAuthor: false,
      author: { name: 'سارا احمدی', role: 'مهندس نرم‌افزار', handle: '@sara', avatarUrl: 'data:image/png;base64,AV', socials },
      showOutroSlide: true,
      ...design,
    },
    slides: [createSlide('cover'), createSlide('cta')],
  })

  const last = (p: Project) =>
    renderToStaticMarkup(<SlideView project={p} slide={p.slides[1]} index={1} total={2} />)

  it('renders the creator card on the closing slide only', () => {
    const p = project()
    expect(last(p)).toContain('in/sara')
    const first = renderToStaticMarkup(<SlideView project={p} slide={p.slides[0]} index={0} total={2} />)
    expect(first).not.toContain('in/sara')
  })

  it('implies showAuthor, so the toggle alone is enough', () => {
    const p = project({ showAuthor: false })
    expect(last(p)).toContain('سارا احمدی')
  })

  it('lists every filled channel with its brand icon', () => {
    const out = last(project())
    for (const value of Object.values(socials)) expect(out).toContain(value)
    // Brand inks from simple-icons / MDI. GitHub and X are black by default, so
    // a dark card gets their light-mode ink instead.
    expect(out).toContain('fill="#0a66c2"')
    expect(out).toContain('fill="#26A5E4"')
    expect(out).toContain('fill="#e6edf3"')
    expect(out).toContain('fill="#ea4335"')
    expect(out).toContain('fill="#0f766e"')
  })

  it('skips channels the author left empty', () => {
    const p = project()
    p.design.author = { ...p.design.author!, socials: { github: 'github.com/sara' } }
    const out = last(p)
    expect(out).toContain('github.com/sara')
    expect(out).not.toContain('in/sara')
  })

  it('uses the Persian default call to action and right alignment', () => {
    const out = last(project())
    expect(out).toContain('ذخیره‌اش کن و با دوستانت به اشتراک بذار')
    expect(out).toContain('text-align:right')
    expect(out).toContain('justify-content:flex-end')
  })

  it('uses the Latin call to action for LTR decks', () => {
    expect(last(project({ direction: 'ltr' }))).toContain('Save it and share it with a friend')
  })

  it('honours a custom CTA', () => {
    expect(last(project({ outroCtaText: 'بیاید حرف بزنیم' }))).toContain('بیاید حرف بزنیم')
  })

  it('pairs the avatar with the lab emblem', () => {
    const out = last(project({ showLabBadge: true, labLogoUrl: 'data:image/png;base64,LAB' }))
    expect(out).toContain('data:image/png;base64,AV')
    expect(out).toContain('data:image/png;base64,LAB')
  })

  it('stays offline-safe: no external references', () => {
    const out = last(project({ showLabBadge: true, labLogoUrl: 'data:image/png;base64,LAB' }))
    expect(out).not.toContain('http://')
    expect(out).not.toContain('https://')
    expect(out).not.toContain('<image')
  })

  it('disappears when the toggle is off', () => {
    const p = project({ showOutroSlide: false, showAuthor: false })
    expect(last(p)).not.toContain('in/sara')
  })

  it('uses black ink for GitHub and X on a light card', () => {
    // 'personal-brand' is a light theme, so the black marks stay black.
    const out = last(project({ themeId: 'personal-brand', direction: 'ltr' }))
    expect(out).toContain('fill="#181717"')
    expect(out).toContain('fill="#000000"')
  })
})

describe('terminal window', () => {
  const base = createBlock('code') as Extract<Block, { type: 'code' }>
  const session = [
    '~/carousel-studio $ pnpm build',
    '✓ built in 340ms',
    'failed to bind port 3000',
  ].join('\n')
  const terminal = (over: Partial<Extract<Block, { type: 'code' }>> = {}) =>
    render({ ...base, mode: 'terminal', code: session, terminalPrompt: '~/carousel-studio $', ...over })

  it('drops the file tab, the language logo and the language badge', () => {
    const html = terminal()
    // No tab geometry, no filename, no logo, no language badge.
    expect(html).not.toContain('App.tsx')
    expect(html).not.toContain('border-top-left-radius')
    expect(html).not.toContain('borderTopLeftRadius')
    expect(html).not.toContain('>TypeScript<')
    // The brand mark is the only 24×24 vector in an editor tab.
    expect(html).not.toContain('fill="#3178C6"')
  })

  it('keeps the macOS traffic lights on the left', () => {
    const html = terminal()
    expect(html).toContain('background:#ff5f56')
    expect(html).toContain('background:#ffbd2e')
    expect(html).toContain('background:#27c93f')
  })

  it('shows a centered session title with a terminal glyph', () => {
    const html = terminal()
    expect(html).toContain('justify-content:center')
    expect(html).toContain('zsh — ~/carousel-studio $')
    // lucide renders SquareTerminal as an svg with two paths
    expect((html.match(/<path/g) ?? []).length).toBeGreaterThan(0)
  })

  it('prefers a custom session title', () => {
    expect(terminal({ terminalTitle: 'admin@studio: ~/carousel-studio' })).toContain('admin@studio: ~/carousel-studio')
  })

  it('never shows a line-number gutter', () => {
    const html = terminal({ showLineNumbers: true })
    expect(html).not.toContain('user-select:none')
    // The gutter is the only place a stray 1 / 2 / 3 column lives.
    expect(html).not.toContain('>1</span>')
  })

  it('colours the prompt path, branch, command and flags', () => {
    const html = terminal({ code: '➜  studio git:(main) $ pnpm build --silent' })
    expect(html).toContain('color:#61afef') // path
    expect(html).toContain('color:#c678dd') // branch
    expect(html).toContain('color:#7ee787') // marker and success line
  })

  it('renders output lines in their own colours', () => {
    const html = terminal()
    expect(html).toContain('color:#f07178') // error line
  })

  it('leaves the editor window exactly as it was', () => {
    const html = render(base)
    expect(html).toContain('App.tsx')
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('border-top-left-radius:10px')
    expect(html).toContain('>1</span>')
    expect(html).not.toContain('zsh —')
  })
})
