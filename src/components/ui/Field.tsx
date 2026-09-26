import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const controlClasses =
  'w-full rounded-lg border border-line bg-app px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/20'

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{children}</span>
      {hint && <span className="text-[11px] text-ink-soft/80">{hint}</span>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClasses, className)} />
}

export function Textarea({ className, rows = 3, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} {...props} className={cn(controlClasses, 'resize-y leading-relaxed', className)} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(controlClasses, 'cursor-pointer appearance-none bg-no-repeat pr-7', className)}>
      {children}
    </select>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-0.5 py-1.5 text-left"
    >
      <span>
        <span className="block text-[13px] text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] text-ink-soft">{description}</span>}
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-4.5' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-[var(--app-brand)]"
      />
      <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-ink-soft">
        {value}
        {suffix}
      </span>
    </div>
  )
}

export function SectionTitle({
  children,
  hint,
  action,
}: {
  children: ReactNode
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{children}</h3>
        {hint && <span className="text-[11px] text-ink-soft/80">{hint}</span>}
      </div>
      {action}
    </div>
  )
}
