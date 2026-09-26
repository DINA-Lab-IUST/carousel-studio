import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label?: string
  icon?: ReactNode
  title?: string
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  full = false,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  size?: 'sm' | 'md'
  full?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-line bg-app p-0.5',
        full && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[6px] font-medium transition-colors',
              size === 'sm' ? 'h-6.5 px-2 text-[11px]' : 'h-8 px-3 text-xs',
              full && 'flex-1',
              active ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
