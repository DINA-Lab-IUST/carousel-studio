import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-strong dark:text-[#100e1c] border border-transparent shadow-sm',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-raised',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-line/60 hover:text-ink',
  soft: 'bg-brand-soft text-brand border border-transparent hover:brightness-95 dark:hover:brightness-110',
  danger: 'bg-transparent text-danger border border-transparent hover:bg-danger/10',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-lg justify-center',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  )
}
