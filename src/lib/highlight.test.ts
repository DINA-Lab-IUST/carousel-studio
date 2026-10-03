import { describe, expect, it } from 'vitest'

import { detectLanguageFromFilename, highlightCode, highlightTerminal, isDarkColor } from './highlight'

describe('highlightCode', () => {
  it('tokenizes tsx without losing characters', () => {
    const code = `import React from 'react'\n\nexport function Carousel() {\n  // note\n  return <div className="x">{1 + 2}</div>\n}`
    const lines = highlightCode(code, 'tsx')
    expect(lines).toHaveLength(6)
    expect(lines.map((line) => line.map((token) => token.text).join('')).join('\n')).toBe(code)
    expect(lines[0][0].kind).toBe('keyword')
    expect(lines[2].some((token) => token.kind === 'function')).toBe(true)
    expect(lines[3].some((token) => token.kind === 'comment')).toBe(true)
  })

  it('carries block comments across lines', () => {
    const lines = highlightCode('/* start\nstill comment\nend */ let x = 1', 'typescript')
    expect(lines[1][0].kind).toBe('comment')
    expect(lines[2].some((token) => token.kind === 'keyword')).toBe(true)
  })

  it('reads markup, stylesheets, json and shell', () => {
    expect(highlightCode('<a href="/x">hi</a>', 'html')[0].some((token) => token.kind === 'tag')).toBe(true)
    expect(highlightCode('.card { color: #ff0000; }', 'css')[0].some((token) => token.kind === 'property')).toBe(true)
    expect(highlightCode('{"a": 1}', 'json')[0].some((token) => token.kind === 'property')).toBe(true)
    expect(highlightCode('npm run build -- --watch', 'bash')[0].some((token) => token.kind === 'option')).toBe(true)
    expect(highlightCode('SELECT id FROM users WHERE age > 21;', 'sql')[0].some((token) => token.kind === 'keyword')).toBe(true)
  })
})

describe('newer languages', () => {
  it('tokenizes Java, C# and C++', () => {
    const java = highlightCode(
      'package demo;\n\npublic final class Main {\n  public static void main(String[] args) throws Exception {\n    System.out.println("hi");\n  }\n}',
      'java',
    )
    const flat = java.map((line) => line.map((token) => token.text).join('')).join('\n')
    expect(flat).toContain('package demo;')
    expect(java.some((line) => line.some((token) => token.kind === 'keyword' && token.text === 'public'))).toBe(true)
    expect(java.some((line) => line.some((token) => token.kind === 'function' && token.text === 'println'))).toBe(true)

    const csharp = highlightCode(
      'using System;\n\npublic record Point(int X, int Y);\n\npublic class Service {\n  public async Task<int> CountAsync() => await Task.FromResult(1);\n}',
      'csharp',
    )
    expect(csharp.some((line) => line.some((token) => token.kind === 'keyword' && token.text === 'record'))).toBe(true)
    expect(csharp.some((line) => line.some((token) => token.kind === 'keyword' && token.text === 'await'))).toBe(true)

    const cpp = highlightCode(
      '#include <vector>\n\ntemplate <typename T>\nconstexpr int maxOf(T a, T b) { return a > b ? a : b; }',
      'cpp',
    )
    expect(cpp[0].some((token) => token.kind === 'keyword' && token.text === '#include')).toBe(true)
    expect(cpp[2].some((token) => token.kind === 'keyword' && token.text === 'template')).toBe(true)
    expect(cpp[2].some((token) => token.kind === 'keyword' && token.text === 'typename')).toBe(true)
    expect(cpp[3].some((token) => token.kind === 'keyword' && token.text === 'constexpr')).toBe(true)
  })

  it('reads annotations and preprocessor directives', () => {
    const java = highlightCode('@Override\npublic String toString() { return null; }', 'java')
    expect(java[0].some((token) => token.kind === 'keyword' && token.text === '@Override')).toBe(true)
  })
})

describe('detectLanguageFromFilename', () => {
  it('maps the extensions a developer actually types', () => {
    expect(detectLanguageFromFilename('Main.java')).toBe('java')
    expect(detectLanguageFromFilename('Program.cs')).toBe('csharp')
    expect(detectLanguageFromFilename('main.cpp')).toBe('cpp')
    expect(detectLanguageFromFilename('shape.hpp')).toBe('cpp')
    expect(detectLanguageFromFilename('App.TSX')).toBe('tsx')
    expect(detectLanguageFromFilename('server.py')).toBe('python')
    expect(detectLanguageFromFilename('deploy.sh')).toBe('bash')
    expect(detectLanguageFromFilename('schema.sql')).toBe('sql')
    expect(detectLanguageFromFilename('main.go')).toBe('go')
  })

  it('returns null when the extension means nothing here', () => {
    expect(detectLanguageFromFilename('README')).toBeNull()
    expect(detectLanguageFromFilename('photo.png')).toBeNull()
    expect(detectLanguageFromFilename('')).toBeNull()
  })
})

describe('highlightTerminal', () => {
  it('splits commands from output', () => {
    const lines = highlightTerminal('~/app $ npm run dev\nready on http://localhost', '~/app $')
    expect(lines[0].kind).toBe('command')
    // The prompt now breaks into a cyan path and a green marker.
    expect(lines[0].tokens[0]).toEqual({ kind: 'path', text: '~/app' })
    expect(lines[0].tokens.some((token) => token.kind === 'prompt' && token.text === '$')).toBe(true)
    expect(lines[0].tokens.map((token) => token.text).join('')).toContain('npm run dev')
    expect(lines[1]).toEqual({
      kind: 'output',
      tokens: [{ kind: 'success', text: 'ready on http://localhost' }],
    })
  })

  it('marks failures and honours bare shell markers', () => {
    const lines = highlightTerminal('$ cargo build\nerror: could not compile', '')
    expect(lines[0].kind).toBe('command')
    expect(lines[1].tokens[0].kind).toBe('error')
  })

  it('breaks a starship prompt into path, branch and marker', () => {
    const lines = highlightTerminal('➜  carousel-studio git:(main) $ pnpm build', '')
    const kinds = new Map(lines[0].tokens.map((token) => [token.text, token.kind]))
    expect(kinds.get('carousel-studio')).toBe('path')
    expect(kinds.get('(main)')).toBe('branch')
    // The leading arrow and the trailing dollar are both markers.
    expect(lines[0].tokens.filter((token) => token.kind === 'prompt').map((token) => token.text)).toEqual([
      '➜', '$', ' ',
    ])
    // The verb after the marker is the command, not part of the prompt.
    expect(lines[0].tokens.find((token) => token.kind === 'command')?.text).toBe('pnpm')
    expect(lines[0].tokens.find((token) => token.kind === 'option')?.text).toBe('build')
  })

  it('does not mistake a shell name for a git branch', () => {
    const lines = highlightTerminal('admin@studio:~/repo (zsh) $ ls', '')
    const kinds = new Map(lines[0].tokens.map((token) => [token.text, token.kind]))
    expect(kinds.get('~/repo')).toBe('path')
    // `(zsh)` is part of one merged plain run, not a branch.
    expect(kinds.get(' (zsh) ')).toBe('plain')
    expect(lines[0].tokens.some((token) => token.kind === 'branch')).toBe(false)
  })

  it('colours the command, its flags and quoted strings', () => {
    const lines = highlightTerminal("~/app $ git commit -am 'initial commit'", '')
    const find = (kind: string) => lines[0].tokens.filter((token) => token.kind === kind).map((token) => token.text)
    expect(find('command')).toEqual(['git'])
    expect(find('option')).toEqual(['commit', '-am'])
    expect(find('string')).toEqual(["'initial commit'"])
  })

  it('marks builds as success and crashes as errors', () => {
    const lines = highlightTerminal('$ pnpm build\n✓ built in 340ms\nfatal: not a git repository', '')
    expect(lines[1].tokens[0].kind).toBe('success')
    expect(lines[2].tokens[0].kind).toBe('error')
  })

  it('round-trips the transcript text', () => {
    const transcript = '$ ls -la\ntotal 8\n➜ ~ npm install --save-dev vitest'
    const lines = highlightTerminal(transcript, '')
    expect(lines.map((line) => line.tokens.map((token) => token.text).join('')).join('\n')).toBe(transcript)
    expect(lines.map((line) => line.kind)).toEqual(['command', 'output', 'command'])
  })

  it('treats a bare marker as output, not a prompt', () => {
    // Diff output starts lines with '>' — that is not a prompt.
    expect(highlightTerminal('> + const added = true', '')[0].kind).toBe('output')
  })
})

describe('isDarkColor', () => {
  it('reads hex luminance', () => {
    expect(isDarkColor('#111318')).toBe(true)
    expect(isDarkColor('#ffffff')).toBe(false)
    expect(isDarkColor('#fff')).toBe(false)
  })
})