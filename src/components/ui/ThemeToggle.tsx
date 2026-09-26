import { Monitor, Moon, Sun } from 'lucide-react'

import { useAppStore } from '../../store/store'
import { Segmented } from './Segmented'

export function ThemeToggle() {
  const appTheme = useAppStore((state) => state.appTheme)
  const setAppTheme = useAppStore((state) => state.setAppTheme)

  return (
    <Segmented
      size="sm"
      value={appTheme}
      onChange={setAppTheme}
      options={[
        { value: 'light', icon: <Sun size={13} />, title: 'Light' },
        { value: 'dark', icon: <Moon size={13} />, title: 'Dark' },
        { value: 'system', icon: <Monitor size={13} />, title: 'System' },
      ]}
    />
  )
}
