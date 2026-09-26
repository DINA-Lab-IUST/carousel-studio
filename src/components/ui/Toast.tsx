import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

type ToastTone = 'info' | 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
}

const TONES: Record<ToastTone, string> = {
  info: 'text-brand',
  success: 'text-emerald-500',
  error: 'text-danger',
}

let nextToastId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextToastId++
    setItems((current) => [...current, { id, message, tone }])
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 2800)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-max max-w-[90vw] -translate-x-1/2 flex-col items-center gap-2">
        {items.map((item) => {
          const Icon = ICONS[item.tone]
          return (
            <div
              key={item.id}
              className="animate-in pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-app"
            >
              <Icon size={15} className={cn('shrink-0', TONES[item.tone])} />
              <span className="max-w-md">{item.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
