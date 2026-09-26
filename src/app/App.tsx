import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ToastProvider } from '../components/ui/Toast'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { EditorPage } from '../features/editor/EditorPage'
import { NewProjectPage } from '../features/newproject/NewProjectPage'
import { PreviewPage } from '../features/preview/PreviewPage'
import { useAppStore } from '../store/store'

function useAppTheme() {
  const appTheme = useAppStore((state) => state.appTheme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = appTheme === 'dark' || (appTheme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    if (appTheme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [appTheme])
}

export default function App() {
  useAppTheme()

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/new" element={<NewProjectPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/editor/:projectId/preview" element={<PreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
