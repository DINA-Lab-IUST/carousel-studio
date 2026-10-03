import type { CodeLanguage } from './types'

/**
 * A tiny, dependency-free tokenizer for the code block.
 *
 * Slides are rasterized by `html-to-image`, so the highlighter must stay pure:
 * it turns source text into flat token runs that the renderer paints as plain
 * `<span>` elements. No AST, no virtual editor, no injected stylesheets.
 */

// ---------------------------------------------------------------------------
// Tokens and palettes
// ---------------------------------------------------------------------------

export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'boolean'
  | 'function'
  | 'type'
  | 'property'
  | 'tag'
  | 'attribute'
  | 'operator'
  | 'punctuation'
  | 'variable'
  | 'command'
  | 'option'
  | 'prompt'
  | 'path'
  | 'branch'
  | 'output'
  | 'error'
  | 'success'

export interface Token {
  kind: TokenKind
  text: string
}

export type HighlightPalette = { [kind in TokenKind]: string }

/**
 * One Dark and One Light — the Atom/VS Code families readers picture when they
 * see a syntax-highlighted snippet. Both are tuned for contrast against their
 * own window chrome.
 */
export const DARK_PALETTE: HighlightPalette = {
  plain: '#abb2bf',
  comment: '#7f848e',
  string: '#98c379',
  number: '#d19a66',
  keyword: '#c678dd',
  boolean: '#56b6c2',
  function: '#61afef',
  type: '#e5c07b',
  property: '#e06c75',
  tag: '#e06c75',
  attribute: '#d19a66',
  operator: '#56b6c2',
  punctuation: '#8b929e',
  variable: '#e06c75',
  command: '#61afef',
  option: '#d19a66',
  prompt: '#7ee787',
  path: '#61afef',
  branch: '#c678dd',
  output: '#9aa5b1',
  error: '#f07178',
  success: '#7ee787',
}

export const LIGHT_PALETTE: HighlightPalette = {
  plain: '#24292f',
  comment: '#8b949e',
  string: '#0a7d33',
  number: '#0550ae',
  keyword: '#cf222e',
  boolean: '#0550ae',
  function: '#8250df',
  type: '#953800',
  property: '#0550ae',
  tag: '#116329',
  attribute: '#0550ae',
  operator: '#cf222e',
  punctuation: '#57606a',
  variable: '#cf222e',
  command: '#8250df',
  option: '#0550ae',
  prompt: '#1a7f37',
  path: '#0550ae',
  branch: '#8250df',
  output: '#57606a',
  error: '#cf222e',
  success: '#1a7f37',
}

// ---------------------------------------------------------------------------
// Language specs
// ---------------------------------------------------------------------------

const LITERALS = ['true', 'false', 'null', 'undefined', 'nil', 'None']

const JS_KEYWORDS = [
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'finally', 'for', 'from',
  'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new',
  'of', 'private', 'protected', 'public', 'readonly', 'return', 'satisfies', 'set', 'static',
  'super', 'switch', 'this', 'throw', 'try', 'type', 'typeof', 'var', 'void', 'while', 'yield',
  'declare', 'namespace',
]

const TS_TYPES = [
  'any', 'bigint', 'boolean', 'never', 'number', 'object', 'string', 'symbol', 'unknown',
  'Array', 'Promise', 'Record', 'Partial', 'Readonly', 'Map', 'Set',
]

const PYTHON_KEYWORDS = [
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
  'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]

const RUST_KEYWORDS = [
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern',
  'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref',
  'return', 'static', 'struct', 'super', 'trait', 'type', 'unsafe', 'use', 'where', 'while',
]

const GO_KEYWORDS = [
  'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for',
  'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return',
  'select', 'struct', 'switch', 'type', 'var',
]

const SQL_KEYWORDS = [
  'add', 'all', 'alter', 'and', 'as', 'asc', 'between', 'by', 'case', 'column', 'commit',
  'create', 'cross', 'database', 'default', 'delete', 'desc', 'distinct', 'drop', 'else', 'end',
  'exists', 'from', 'full', 'group', 'having', 'in', 'index', 'inner', 'insert', 'into', 'is',
  'join', 'key', 'left', 'limit', 'not', 'null', 'offset', 'on', 'or', 'order', 'outer',
  'primary', 'references', 'right', 'rollback', 'select', 'set', 'table', 'then', 'transaction',
  'union', 'update', 'values', 'view', 'when', 'where', 'with',
]

const JAVA_KEYWORDS = [
  'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'do',
  'else', 'enum', 'extends', 'final', 'finally', 'for', 'if', 'implements', 'import', 'instanceof',
  'interface', 'native', 'new', 'package', 'permits', 'private', 'protected', 'public', 'record',
  'return', 'sealed', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'volatile', 'while', 'yield',
]

const JAVA_TYPES = [
  'boolean', 'byte', 'char', 'double', 'float', 'int', 'long', 'short', 'void', 'var',
  'Boolean', 'Double', 'Float', 'Integer', 'Long', 'Object', 'String', 'StringBuilder', 'List',
  'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Optional', 'Stream', 'Exception',
]

const CSHARP_KEYWORDS = [
  'abstract', 'as', 'base', 'break', 'case', 'catch', 'checked', 'class', 'const', 'continue',
  'default', 'delegate', 'do', 'else', 'enum', 'event', 'explicit', 'extern', 'finally', 'fixed',
  'for', 'foreach', 'get', 'goto', 'if', 'implicit', 'in', 'init', 'interface', 'internal', 'is',
  'lock', 'namespace', 'new', 'operator', 'out', 'override', 'params', 'partial', 'private',
  'protected', 'public', 'readonly', 'record', 'ref', 'return', 'sealed', 'set', 'sizeof',
  'stackalloc', 'static', 'struct', 'switch', 'this', 'throw', 'try', 'typeof', 'unchecked',
  'unsafe', 'using', 'virtual', 'volatile', 'while', 'yield', 'nameof', 'async', 'await', 'var',
]

const CSHARP_TYPES = [
  'bool', 'byte', 'char', 'decimal', 'double', 'float', 'int', 'long', 'object', 'sbyte',
  'short', 'string', 'uint', 'ulong', 'ushort', 'void', 'dynamic', 'var',
  'Boolean', 'Decimal', 'Double', 'Guid', 'Int32', 'List', 'Dictionary', 'IEnumerable', 'Nullable',
  'String', 'Task', 'ValueTask',
]

const CPP_KEYWORDS = [
  'alignas', 'auto', 'break', 'case', 'catch', 'class', 'concept', 'const', 'consteval',
  'constexpr', 'constinit', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype',
  'default', 'delete', 'do', 'else', 'enum', 'explicit', 'export', 'extern', 'final', 'for',
  'friend', 'goto', 'if', 'inline', 'mutable', 'namespace', 'new', 'noexcept', 'operator',
  'override', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'requires',
  'return', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template',
  'this', 'throw', 'try', 'typedef', 'typename', 'union', 'using', 'virtual', 'volatile', 'while',
]

const CPP_TYPES = [
  'bool', 'char', 'char16_t', 'char32_t', 'char8_t', 'double', 'float', 'int', 'long', 'short',
  'signed', 'size_t', 'unsigned', 'void', 'wchar_t',
  'string', 'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'optional', 'unique_ptr',
  'shared_ptr', 'ostream', 'istream', 'std',
]

const CSS_KEYWORDS = ['important', 'inherit', 'initial', 'unset', 'auto', 'none', 'var']

const SHELL_KEYWORDS = [
  'case', 'cd', 'do', 'done', 'echo', 'elif', 'else', 'esac', 'export', 'fi', 'for', 'function',
  'if', 'in', 'local', 'return', 'source', 'then', 'while',
]

const wordSet = (words: string[]) => new Set(words)

export interface LanguageSpec {
  /** Marker that comments out the remainder of the line. */
  lineComments: string[]
  /** Paired markers for comments that span lines. */
  blockComment: readonly [string, string] | null
  keywords: Set<string>
  types: Set<string>
  literals: Set<string>
  quotes: string[]
  /** True when a backslash escapes the next character inside a string. */
  escapes: boolean
  /** Characters that start a word, beyond letters and digits. */
  wordStart: string
  family: 'c' | 'python' | 'html' | 'css' | 'json' | 'shell' | 'sql'
}

const C_LIKE: LanguageSpec = {
  lineComments: ['//'],
  blockComment: ['/*', '*/'],
  keywords: wordSet(JS_KEYWORDS),
  types: wordSet(TS_TYPES),
  literals: wordSet(LITERALS),
  quotes: ["'", '"', '`'],
  escapes: true,
  wordStart: '_$@',
  family: 'c',
}

const HTML_SPEC: LanguageSpec = {
  lineComments: [],
  blockComment: ['<!--', '-->'],
  keywords: wordSet([]),
  types: wordSet([]),
  literals: wordSet([]),
  quotes: ['"', "'"],
  escapes: false,
  wordStart: '-',
  family: 'html',
}

export const LANGUAGE_SPECS: Record<CodeLanguage, LanguageSpec> = {
  typescript: C_LIKE,
  javascript: C_LIKE,
  tsx: C_LIKE,
  jsx: C_LIKE,
  rust: {
    ...C_LIKE,
    keywords: wordSet(RUST_KEYWORDS),
    types: wordSet(['String', 'Vec', 'Option', 'Result', 'bool', 'char', 'f32', 'f64', 'i32', 'i64', 'str', 'u32', 'u64']),
  },
  go: {
    ...C_LIKE,
    keywords: wordSet(GO_KEYWORDS),
    types: wordSet(['bool', 'byte', 'error', 'float64', 'int', 'int64', 'rune', 'string']),
    quotes: ['"', '`'],
  },
  python: {
    lineComments: ['#'],
    blockComment: null,
    keywords: wordSet(PYTHON_KEYWORDS),
    types: wordSet(['bool', 'bytes', 'dict', 'float', 'int', 'list', 'set', 'str', 'tuple']),
    literals: wordSet(['True', 'False', 'None']),
    quotes: ['"', "'"],
    escapes: true,
    wordStart: '_@',
    family: 'python',
  },
  html: HTML_SPEC,
  css: {
    lineComments: [],
    blockComment: ['/*', '*/'],
    keywords: wordSet(CSS_KEYWORDS),
    types: wordSet([]),
    literals: wordSet(LITERALS),
    quotes: ['"', "'"],
    escapes: true,
    wordStart: '-@',
    family: 'css',
  },
  json: {
    lineComments: [],
    blockComment: null,
    keywords: wordSet([]),
    types: wordSet([]),
    literals: wordSet(['true', 'false', 'null']),
    quotes: ['"'],
    escapes: true,
    wordStart: '_$',
    family: 'json',
  },
  bash: {
    lineComments: ['#'],
    blockComment: null,
    keywords: wordSet(SHELL_KEYWORDS),
    types: wordSet([]),
    literals: wordSet([]),
    quotes: ['"', "'"],
    escapes: true,
    wordStart: '_',
    family: 'shell',
  },
  java: {
    ...C_LIKE,
    keywords: wordSet(JAVA_KEYWORDS),
    types: wordSet(JAVA_TYPES),
    literals: wordSet(['true', 'false', 'null']),
    wordStart: '_$@',
  },
  csharp: {
    ...C_LIKE,
    keywords: wordSet(CSHARP_KEYWORDS),
    types: wordSet(CSHARP_TYPES),
    literals: wordSet(['true', 'false', 'null']),
    wordStart: '_$@',
  },
  cpp: {
    ...C_LIKE,
    keywords: wordSet(CPP_KEYWORDS),
    types: wordSet(CPP_TYPES),
    literals: wordSet(['true', 'false', 'nullptr', 'NULL', 'this']),
    wordStart: '_$@#',
  },
  sql: {
    lineComments: ['--'],
    blockComment: ['/*', '*/'],
    keywords: wordSet(SQL_KEYWORDS),
    types: wordSet(['boolean', 'date', 'int', 'integer', 'numeric', 'serial', 'text', 'timestamp', 'uuid', 'varchar']),
    literals: wordSet(['true', 'false', 'null']),
    quotes: ["'", '"'],
    escapes: true,
    wordStart: '_@#',
    family: 'sql',
  },
}

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  tsx: 'TSX',
  jsx: 'JSX',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  rust: 'Rust',
  go: 'Go',
  sql: 'SQL',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
}

export const CODE_LANGUAGES: CodeLanguage[] = Object.keys(LANGUAGE_SPECS) as CodeLanguage[]

/** Filename extensions that map onto a tokenizer, longest first so .hpp wins over .h. */
const EXTENSION_LANGUAGES: Record<string, CodeLanguage> = {
  tsx: 'tsx',
  jsx: 'jsx',
  ts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  java: 'java',
  cs: 'csharp',
  cpp: 'cpp',
  cxx: 'cpp',
  cc: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
  c: 'cpp',
  h: 'cpp',
  go: 'go',
  rs: 'rust',
  html: 'html',
  htm: 'html',
  css: 'css',
  json: 'json',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
}

/**
 * Infers the tokenizer from a filename, so renaming a tab to `Main.java` switches
 * the highlighting and the logo. Returns null when the extension is unknown.
 */
export function detectLanguageFromFilename(filename: string): CodeLanguage | null {
  const match = /\.([A-Za-z0-9]+)$/.exec(filename.trim())
  if (!match) return null
  return EXTENSION_LANGUAGES[match[1].toLowerCase()] ?? null
}

// ---------------------------------------------------------------------------
// Scanner primitives
// ---------------------------------------------------------------------------

const isDigit = (char: string) => char >= '0' && char <= '9'
const isWordStart = (char: string) => /[A-Za-z_]/.test(char)
const OPERATOR_CHARS = '+-*/%=<>!&|^~?:.'
const PUNCTUATION_CHARS = '{}()[];,'

function push(tokens: Token[], kind: TokenKind, text: string) {
  // Merging adjacent runs of the same kind keeps the DOM small enough to rasterize quickly.
  const last = tokens[tokens.length - 1]
  if (last && last.kind === kind) last.text += text
  else tokens.push({ kind, text })
}

/** Block comments are the only scanner state that survives a line break. */
interface ScanState {
  inBlockComment: boolean
  /** Style sheets additionally track whether we are inside a declaration block. */
  inDeclaration?: boolean
}

const NO_ESCAPES: LanguageSpec = { ...HTML_SPEC, escapes: false }

function scanString(source: string, start: number, spec: LanguageSpec): string {
  const quote = source[start]
  let index = start + 1
  while (index < source.length) {
    const char = source[index]
    if (spec.escapes && char === '\\') {
      index += 2
      continue
    }
    if (char === quote) {
      index += 1
      break
    }
    index += 1
  }
  return source.slice(start, Math.min(index, source.length))
}

/** Markup is simple enough to read as one tag at a time. */
function scanMarkup(line: string): Token[] {
  const tokens: Token[] = []
  const trimmed = line.trimStart()
  push(tokens, 'plain', line.slice(0, line.length - trimmed.length))

  if (!trimmed.startsWith('<')) {
    push(tokens, 'plain', trimmed)
    return tokens
  }

  const close = trimmed.indexOf('>')
  const inner = close === -1 ? trimmed.slice(1) : trimmed.slice(1, close)
  push(tokens, 'punctuation', '<')

  let index = 0
  while (index < inner.length) {
    const char = inner[index]
    const rest = inner.slice(index)

    if (char === '"' || char === "'") {
      const value = scanString(inner, index, NO_ESCAPES)
      push(tokens, 'string', value)
      index += value.length
      continue
    }

    const attribute = /^[A-Za-z0-9:._-]+(?=\s*=)/.exec(rest)
    if (attribute) {
      push(tokens, 'attribute', attribute[0])
      index += attribute[0].length
      continue
    }

    const word = /^[A-Za-z0-9:._-]+/.exec(rest)
    if (word) {
      push(tokens, 'tag', word[0])
      index += word[0].length
      continue
    }

    if (char === '/' || char === '=') {
      push(tokens, 'operator', char)
      index += 1
      continue
    }

    push(tokens, 'plain', char)
    index += 1
  }

  if (close !== -1) {
    push(tokens, 'operator', '>')
    push(tokens, 'plain', trimmed.slice(close + 1))
  }
  return tokens
}

/** Style sheets read best when the property stands out from its value. */
function scanStyleSheet(line: string, state: ScanState): Token[] {
  const tokens: Token[] = []

  if (state.inBlockComment) {
    const end = line.indexOf('*/')
    if (end === -1) return [{ kind: 'comment', text: line }]
    push(tokens, 'comment', line.slice(0, end + 2))
    state.inBlockComment = false
    return tokens.concat(scanStyleSheet(line.slice(end + 2), state))
  }

  const declaration = /^(\s*)([-A-Za-z]+)(\s*:\s*)(.*)$/.exec(line)
  if (declaration) {
    const [, indent, property, separator, value] = declaration
    push(tokens, 'plain', indent)
    push(tokens, 'property', property)
    push(tokens, 'punctuation', separator)
    const hex = /^#[0-9A-Fa-f]{3,8}/.exec(value)
    if (hex) {
      push(tokens, 'number', hex[0])
      push(tokens, 'plain', value.slice(hex[0].length))
    } else {
      push(tokens, 'string', value)
    }
    return tokens
  }

  let index = 0
  while (index < line.length) {
    const char = line[index]
    const rest = line.slice(index)

    if (rest.startsWith('/*')) {
      const end = line.indexOf('*/', index + 2)
      if (end === -1) {
        push(tokens, 'comment', rest)
        state.inBlockComment = true
        break
      }
      push(tokens, 'comment', line.slice(index, end + 2))
      index = end + 2
      continue
    }

    if (char === '@') {
      const atRule = /^@[\w-]+/.exec(rest)
      push(tokens, 'keyword', atRule ? atRule[0] : char)
      index += atRule ? atRule[0].length : 1
      continue
    }

    if (char === '{') state.inDeclaration = true
    if (char === '}') state.inDeclaration = false
    if (char === '{' || char === '}' || char === ':' || char === ';') {
      push(tokens, 'punctuation', char)
      index += 1
      continue
    }

    if (char === '"' || char === "'") {
      const value = scanString(line, index, LANGUAGE_SPECS.css)
      push(tokens, 'string', value)
      index += value.length
      continue
    }

    if (isDigit(char) || (char === '.' && isDigit(line[index + 1] ?? ''))) {
      const number = /^(?:#[0-9A-Fa-f]{3,8}|\d[\d.]*(?:px|rem|em|%|vh|vw|s|ms|deg)?)/.exec(rest)
      push(tokens, 'number', number ? number[0] : char)
      index += number ? number[0].length : 1
      continue
    }

    const selector = /^[.#]?[A-Za-z][\w-]*/.exec(rest)
    if (selector) {
      const ahead = line.slice(index + selector[0].length)
      push(tokens, state.inDeclaration && ahead.trimStart().startsWith(':') ? 'property' : 'type', selector[0])
      index += selector[0].length
      continue
    }

    push(tokens, 'plain', char)
    index += 1
  }
  return tokens
}

/** The general scanner: C-like, Python, JSON, SQL and shell all land here. */
function scanGeneric(line: string, spec: LanguageSpec, state: ScanState): Token[] {
  const tokens: Token[] = []

  if (state.inBlockComment && spec.blockComment) {
    const close = spec.blockComment[1]
    const end = line.indexOf(close)
    if (end === -1) return [{ kind: 'comment', text: line }]
    push(tokens, 'comment', line.slice(0, end + close.length))
    state.inBlockComment = false
    return tokens.concat(scanGeneric(line.slice(end + close.length), spec, state))
  }

  let index = 0
  while (index < line.length) {
    const char = line[index]
    const rest = line.slice(index)

    if (spec.blockComment && rest.startsWith(spec.blockComment[0])) {
      const open = spec.blockComment[0]
      const close = spec.blockComment[1]
      const end = line.indexOf(close, index + open.length)
      if (end === -1) {
        push(tokens, 'comment', rest)
        state.inBlockComment = true
        break
      }
      push(tokens, 'comment', line.slice(index, end + close.length))
      index = end + close.length
      continue
    }

    const lineComment = spec.lineComments.find((marker) => rest.startsWith(marker))
    if (lineComment) {
      push(tokens, 'comment', rest)
      break
    }

    if (spec.quotes.includes(char)) {
      const value = scanString(line, index, spec)
      // In JSON a string followed by a colon is a key, not a value.
      const isKey = spec.family === 'json' && line.slice(index + value.length).trimStart().startsWith(':')
      push(tokens, isKey ? 'property' : 'string', value)
      index += value.length
      continue
    }

    if (char === '$') {
      const variable = /^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/.exec(rest)
      push(tokens, variable ? 'variable' : 'operator', variable ? variable[0] : char)
      index += variable ? variable[0].length : 1
      continue
    }

    // Preprocessor directives (#include, #define) read as keywords.
    if (char === '#' && /^[A-Za-z_]/.test(rest[1] ?? '')) {
      const directive = /^#[A-Za-z_][A-Za-z0-9_]*/.exec(rest)
      push(tokens, 'keyword', directive ? directive[0] : char)
      index += directive ? directive[0].length : 1
      continue
    }

    // Annotations and decorators (@Override, @dataclass) read as keywords too.
    if (char === '@' && (spec.family === 'c' || spec.family === 'python') && /^[A-Za-z_]/.test(rest[1] ?? '')) {
      const annotation = /^@[A-Za-z_][A-Za-z0-9_]*/.exec(rest)
      push(tokens, 'keyword', annotation ? annotation[0] : char)
      index += annotation ? annotation[0].length : 1
      continue
    }

    // Flags must win over word scanning because '-', '--' and '-p' all start with a dash.
    const flag = spec.family === 'shell' ? /^-{1,2}[A-Za-z][\w-]*/.exec(rest) : null
    if (flag) {
      push(tokens, 'option', flag[0])
      index += flag[0].length
      continue
    }

    if (isDigit(char) || (char === '.' && isDigit(line[index + 1] ?? ''))) {
      const number = /^(?:0[xXbBoO][0-9A-Fa-f_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)[A-Za-z%]*/.exec(rest)
      push(tokens, 'number', number ? number[0] : char)
      index += number ? number[0].length : 1
      continue
    }

    if (isWordStart(char) || spec.wordStart.includes(char)) {
      const word = /^[A-Za-z0-9_]+/.exec(rest)
      if (!word) {
        push(tokens, 'plain', char)
        index += 1
        continue
      }
      const value = word[0]
      index += value.length
      const ahead = line.slice(index)
      const followedByParen = ahead.trimStart().startsWith('(')
      const followedByColon = ahead.trimStart().startsWith(':')
      // SQL is conventionally written in upper case, so that family matches case-insensitively.
      const folded = spec.family === 'sql' ? value.toLowerCase() : value

      if (spec.literals.has(value) || spec.literals.has(folded)) push(tokens, 'boolean', value)
      else if (spec.keywords.has(value) || spec.keywords.has(folded)) push(tokens, 'keyword', value)
      else if (followedByParen) push(tokens, 'function', value)
      else if (followedByColon) push(tokens, 'property', value)
      else if (spec.types.has(value) || spec.types.has(folded)) push(tokens, 'type', value)
      else if (/^[A-Z]/.test(value)) push(tokens, 'type', value)
      else push(tokens, 'plain', value)
      continue
    }

    if (OPERATOR_CHARS.includes(char)) {
      const operator = /^[+\-*/%=<>!&|^~?:.]+/.exec(rest)
      push(tokens, 'operator', operator ? operator[0] : char)
      index += operator ? operator[0].length : 1
      continue
    }

    if (PUNCTUATION_CHARS.includes(char)) {
      push(tokens, 'punctuation', char)
      index += 1
      continue
    }

    push(tokens, 'plain', char)
    index += 1
  }

  return tokens
}

function scanLine(line: string, spec: LanguageSpec, state: ScanState): Token[] {
  switch (spec.family) {
    case 'html':
      return scanMarkup(line)
    case 'css':
      return scanStyleSheet(line, state)
    default:
      return scanGeneric(line, spec, state)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Highlights a whole snippet, returning one token list per source line. */
export function highlightCode(code: string, language: CodeLanguage): Token[][] {
  const spec = LANGUAGE_SPECS[language] ?? LANGUAGE_SPECS.typescript
  const state: ScanState = { inBlockComment: false }
  return code.split('\n').map((line) => {
    const tokens = scanLine(line, spec, state)
    return tokens.length > 0 ? tokens : [{ kind: 'plain' as TokenKind, text: '' }]
  })
}

/** One shell line: either something the user typed or the shell answering. */
export interface TerminalLine {
  kind: 'command' | 'output'
  tokens: Token[]
}

/** Arrow and `$` prompts are commonly bare; `>` and `#` only lead a line when something precedes them. */
const COMMAND_MARKERS: { marker: string; bare: boolean; strong: boolean }[] = [
  // `strong` markers only ever appear in a prompt; weak ones double as redirects.
  { marker: '❯ ', bare: true, strong: true },
  { marker: '➜ ', bare: true, strong: true },
  { marker: '$ ', bare: true, strong: true },
  { marker: '» ', bare: true, strong: true },
  { marker: '› ', bare: true, strong: true },
  { marker: '# ', bare: false, strong: false },
  { marker: '> ', bare: false, strong: false },
]
const MAX_PROMPT_LENGTH = 48

const FAILURE_PATTERN = /\b(error|failed|failure|fatal|denied|cannot|panic|invalid|cannot find)\b|^\s*(npm ERR!|\[error\])/i
const SUCCESS_PATTERN = /(\u2713|\u2714|\u2717\s*$)|\b(success|passed|compiled|built in|ready in|ready\b|up-to-date|installed|finished)\b/i

/** Bracketed names that identify a shell rather than a git branch. */
const SHELL_NAMES = new Set([
  '(zsh)', '(bash)', '(fish)', '(sh)', '(dash)', '(ksh)', '(pwsh)', '(nu)', '(nushell)', '(csh)', '(tcsh)',
])

/** Characters a bare shell marker is made of, e.g. `$`, `#`, `%`, `❯`, `➜`. */
const MARKER_CHARS = '$#%>❯➜»›'

/** True when a whitespace-delimited chunk is nothing but marker glyphs. */
function isMarkerChunk(chunk: string): boolean {
  return chunk.length > 0 && [...chunk].every((char) => MARKER_CHARS.includes(char))
}

/**
 * Colours one part of a shell prompt the way Starship and Oh My Zsh do.
 *
 * Recognised pieces, in the order shells tend to show them: a bracketed git
 * branch in magenta, a working directory in cyan, and a trailing marker in
 * green. Anything else — `user@host:`, `zsh`, a version hint — stays plain so it
 * does not compete with the two parts a reader is actually scanning for.
 */
function promptToken(part: string): Token[] {
  // `git:(main)` is two pieces: the dim `git:` prefix and the bright branch.
  const prefixed = part.match(/^(git|starship):(\([^)]*\))$/)
  if (prefixed) {
    return [
      { kind: 'plain', text: prefixed[1] },
      { kind: 'plain', text: ':' },
      { kind: 'branch', text: prefixed[2] },
    ]
  }

  // A bare `(main)` / `(HEAD detached)` is the branch — but `(zsh)` is the shell.
  if (/^\([A-Za-z0-9_./~ +-]+\)$/.test(part) && !SHELL_NAMES.has(part.toLowerCase())) {
    return [{ kind: 'branch', text: part }]
  }

  // `~/carousel-studio`, `/usr/local`, `./src`
  if (/^(~|\.{1,2})?\/?[\w.@+-]*\/[\w.@+~/-]*$/.test(part) && /[\/~]/.test(part)) {
    return [{ kind: 'path', text: part }]
  }

  // Starship shortens `~/proj` to a bare directory name, so `carousel-studio`
  // counts as the path too — unless the word is clearly something else.
  if (/^[\w][\w.+-]*$/.test(part) && !/^(git|starship|user|root|admin)$/.test(part)) {
    return [{ kind: 'path', text: part }]
  }

  // `admin@studio:~/carousel-studio` — the host prefix stays plain, path is bright.
  const prefixedPath = part.match(/^(.*?:)((?:~|\.{1,2})?\/?[\w.@+-]*\/[\w.@+~/-]*)$/)
  if (prefixedPath) {
    return [
      { kind: 'plain', text: prefixedPath[1] },
      { kind: 'path', text: prefixedPath[2] },
    ]
  }

  return [{ kind: 'plain', text: part }]
}

/**
 * Splits a prompt into coloured tokens, preserving the original spacing.
 *
 * The marker is whatever the prompt ends with, so it lands last and stays green.
 * Adjacent plain runs are merged to keep the token list small.
 */
function promptTokens(prompt: string): Token[] {
  const parts = prompt.split(/(\s+)/)
  const tokens: Token[] = []
  const push = (kind: TokenKind, text: string) => {
    const previous = tokens[tokens.length - 1]
    if (previous && previous.kind === kind) previous.text += text
    else tokens.push({ kind, text })
  }

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      push('plain', part)
      continue
    }
    // A marker anywhere in the prompt is green: Starship leads with `➜`, bash
    // ends with `$`. `~` is deliberately not a marker, since `~/code` is a path.
    if (isMarkerChunk(part)) {
      push('prompt', part)
      continue
    }
    promptToken(part).forEach((token) => push(token.kind, token.text))
  }

  return tokens
}

/**
 * Colours a shell command: the program, its subcommand, any flags, and strings.
 *
 * Runs of bare words after the program stay plain, because in a real transcript
 * those are usually arguments (a branch name, a port, a glob) rather than verbs.
 */
function tokenizeCommand(text: string): Token[] {
  const tokens: Token[] = []
  let plain = ''
  let words = 0

  const flush = () => {
    if (plain) {
      tokens.push({ kind: 'plain', text: plain })
      plain = ''
    }
  }
  const add = (kind: TokenKind, value: string) => {
    flush()
    tokens.push({ kind, text: value })
  }

  let index = 0
  while (index < text.length) {
    const char = text[index]

    // Quoted argument, with escape awareness inside double quotes.
    if (char === '"' || char === "'") {
      let end = index + 1
      while (end < text.length) {
        if (text[end] === '\\' && char === '"') end += 2
        else if (text[end] === char) {
          end++
          break
        } else end++
      }
      add('string', text.slice(index, end))
      index = end
      continue
    }

    // Flag or option: `-v`, `--save-dev`, `-rf`. Must follow whitespace so a
    // negative number or a hyphen inside a word is left alone.
    if (char === '-' && /\s/.test(text[index - 1] ?? ' ')) {
      const flag = text.slice(index).match(/^-{1,2}[A-Za-z][\w-]*/)
      if (flag) {
        add('option', flag[0])
        index += flag[0].length
        continue
      }
    }

    if (/\s/.test(char)) {
      plain += char
      index++
      continue
    }

    let end = index
    while (end < text.length && !/[\s"']/.test(text[end]) && !(text[end] === '-' && /\s/.test(text[end - 1] ?? ' '))) end++

    const word = text.slice(index, end)
    // Program first, then its verb; anything beyond that is a plain argument.
    if (words === 0) add('command', word)
    else if (words === 1) add('option', word)
    else plain += word
    words++
    index = end
  }

  flush()
  return tokens.length > 0 ? tokens : [{ kind: 'plain', text: '' }]
}

/**
 * Peels the prompt off a shell line.
 *
 * A prompt always ends in a marker (`$`, `>`, `#`, `➜`), so the command is
 * whatever follows the earliest one. Quotes before the marker mean the line is
 * command text that happens to contain a marker, not a prompt.
 */
function splitPrompt(line: string): { prompt: string; command: string } | null {
  const candidates: { end: number; prompt: string; strong: boolean }[] = []

  for (const { marker, bare, strong } of COMMAND_MARKERS) {
    let from = 0
    for (;;) {
      const index = line.indexOf(marker, from)
      if (index === -1) break
      from = index + marker.length
      const prompt = line.slice(0, index + marker.length).trimEnd()
      if (!bare && prompt === marker.trim()) continue
      if (prompt.length === 0 || prompt.length > MAX_PROMPT_LENGTH) continue
      // Quoted text before the marker means this is command text, not a prompt.
      if (/['"]/.test(prompt)) continue
      candidates.push({ end: index + marker.length, prompt, strong })
    }
  }

  if (candidates.length === 0) return null

  /**
   * Prefer the last strong marker. A Starship prompt such as
   * `➜  project git:(main) $ docker up` carries two markers, and the trailing
   * `$` is the one that ends the prompt. Weak markers (`>`) double as shell
   * redirects, so they are only considered when nothing stronger is present.
   */
  const strong = candidates.filter((candidate) => candidate.strong)
  const pool = strong.length > 0 ? strong : candidates
  const found = pool[pool.length - 1]

  // Normalise the seam: the caller inserts exactly one space between the two.
  return { prompt: found.prompt.trimEnd(), command: line.slice(found.end).trimStart() }
}

/**
 * Splits a transcript into commands and their output.
 *
 * A line counts as a command when it carries the block's own prompt or any
 * shell marker; everything else is output until the next command line appears.
 */
export function highlightTerminal(code: string, prompt: string): TerminalLine[] {
  const own = prompt.trim()

  return code.split('\n').map((line): TerminalLine => {
    const trimmed = line.trimStart()
    const indent = line.slice(0, line.length - trimmed.length)

    const split = own && trimmed.startsWith(own)
      ? { prompt: own.trimEnd(), command: trimmed.slice(own.length).trimStart() }
      : splitPrompt(trimmed)

    if (!split) {
      const kind: TokenKind = FAILURE_PATTERN.test(trimmed)
        ? 'error'
        : SUCCESS_PATTERN.test(trimmed)
          ? 'success'
          : 'output'
      return { kind: 'output', tokens: [{ kind, text: line }] }
    }

    return {
      kind: 'command',
      tokens: [
        ...(indent ? [{ kind: 'plain' as TokenKind, text: indent }] : []),
        // The prompt breaks into path / branch / marker so each reads on its own.
        ...promptTokens(split.prompt),
        { kind: 'prompt', text: ' ' },
        ...tokenizeCommand(split.command),
      ],
    }
  })
}

/** Rough surface luminance, used when a block is set to follow the slide theme. */
export function isDarkColor(color: string): boolean {
  const hex = color.trim().replace('#', '')
  const full = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return true
  const red = parseInt(full.slice(0, 2), 16)
  const green = parseInt(full.slice(2, 4), 16)
  const blue = parseInt(full.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 < 128
}
