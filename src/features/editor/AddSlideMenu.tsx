import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../../components/ui/Button'
import { Menu } from '../../components/ui/Menu'
import { LAYOUTS } from '../../lib/layouts'
import type { LayoutId } from '../../lib/types'
import { useAppStore } from '../../store/store'

export function AddSlideMenu({
  onAdd,
  trigger,
  variant = 'secondary',
  size = 'sm',
  align = 'left',
  className,
}: {
  onAdd?: (layout: LayoutId) => void
  trigger?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'right'
  className?: string
}) {
  const addSlide = useAppStore((state) => state.addSlide)

  return (
    <Menu
      align={align}
      className={className}
      trigger={({ toggle }) => (
        <Button variant={variant} size={size} onClick={toggle}>
          {trigger ?? (
            <>
              <Plus size={14} />
              Add slide
            </>
          )}
        </Button>
      )}
      items={LAYOUTS.map((layout) => ({
        label: `${layout.label} — ${layout.hint}`,
        onSelect: () => {
          if (onAdd) onAdd(layout.id)
          else addSlide(layout.id)
        },
      }))}
    />
  )
}
