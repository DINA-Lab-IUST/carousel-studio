import { getPlatform } from '../../lib/platforms'
import type { Project, Slide } from '../../lib/types'
import { cn } from '../../lib/utils'
import { SlideView } from './SlideView'

/**
 * Renders a slide at its true pixel size and scales it with a transform, so
 * thumbnails, canvas and export all show exactly the same layout.
 */
export function SlideFrame({
  project,
  slide,
  index,
  total,
  width,
  interactive = false,
  selectedBlockId,
  onSelectBlock,
  onPatchBlock,
  className,
  onClick,
}: {
  project: Project
  slide: Slide
  index: number
  total: number
  width: number
  interactive?: boolean
  selectedBlockId?: string | null
  onSelectBlock?: (blockId: string) => void
  onPatchBlock?: (blockId: string, patch: Record<string, unknown>) => void
  className?: string
  onClick?: () => void
}) {
  const platform = getPlatform(project.design.platformId)
  const scale = width / platform.width

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={onClick}
      style={{ width, height: platform.height * scale }}
    >
      <div
        style={{
          width: platform.width,
          height: platform.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <SlideView
          project={project}
          slide={slide}
          index={index}
          total={total}
          interactive={interactive}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onPatchBlock={onPatchBlock}
        />
      </div>
    </div>
  )
}
