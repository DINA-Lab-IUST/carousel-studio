import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/**
 * Renders text and lets the user edit it directly on the slide.
 *
 * The element is uncontrolled while focused (so the caret never jumps) and only
 * syncs from props when the user is not editing it.
 */
export function EditableText({
  value,
  onChange,
  editable = false,
  multiline = false,
  className,
  style,
  placeholder,
  onFocusChange,
}: {
  value: string
  onChange?: (value: string) => void
  editable?: boolean
  multiline?: boolean
  className?: string
  style?: CSSProperties
  placeholder?: string
  onFocusChange?: (focused: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || focused) return
    if (element.innerText !== value) element.innerText = value
  }, [value, focused])

  const commit = () => {
    const text = (ref.current?.innerText ?? '').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '')
    if (text !== value) onChange?.(text)
  }

  return (
    <div
      ref={ref}
      role={editable ? 'textbox' : undefined}
      tabIndex={editable ? 0 : undefined}
      contentEditable={editable || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      className={cn(
        editable && 'cursor-text rounded-[6px] outline-none focus:ring-2 focus:ring-white/40',
        editable && 'hover:bg-white/5',
        '[&:empty]:before:text-[inherit] [&:empty]:before:opacity-40 [&:empty]:before:content-[attr(data-placeholder)]',
        className,
      )}
      style={style}
      onFocus={() => {
        setFocused(true)
        onFocusChange?.(true)
      }}
      onBlur={() => {
        setFocused(false)
        onFocusChange?.(false)
        commit()
      }}
      onKeyDown={(event) => {
        // Let the browser handle text editing shortcuts; keep app-level undo out of the way.
        if (event.metaKey || event.ctrlKey) event.stopPropagation()
        if (event.key === 'Escape') {
          ref.current?.blur()
        }
        if (!multiline && event.key === 'Enter') {
          event.preventDefault()
          ref.current?.blur()
        }
      }}
    />
  )
}
