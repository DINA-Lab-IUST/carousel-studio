import { Palette, Type } from 'lucide-react'

import { Segmented } from '../../components/ui/Segmented'
import type { Project } from '../../lib/types'
import { useAppStore } from '../../store/store'
import { ContentPanel } from './ContentPanel'
import { DesignPanel } from './DesignPanel'

export function RightPanel({ project, visible }: { project: Project; visible: boolean }) {
  const panelTab = useAppStore((state) => state.panelTab)
  const setPanelTab = useAppStore((state) => state.setPanelTab)

  if (!visible) return null

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-line bg-surface xl:w-[340px]">
      <div className="border-b border-line p-3">
        <Segmented
          full
          value={panelTab}
          onChange={setPanelTab}
          options={[
            { value: 'content', label: 'Content', icon: <Type size={13} /> },
            { value: 'design', label: 'Design', icon: <Palette size={13} /> },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {panelTab === 'content' ? <ContentPanel project={project} /> : <DesignPanel project={project} />}
      </div>
    </aside>
  )
}
