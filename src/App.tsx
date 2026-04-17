import { useEffect } from 'react'
import { useUIStore } from '@/store/uiSlice'
import { useTaskStore } from '@/store/taskSlice'
import { useAIStore } from '@/store/aiSlice'
import { usePomodoro } from '@/hooks/usePomodoro'
import { useAudio } from '@/hooks/useAudio'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { seedDatabase } from '@/services/db/database'
import { deadlineScheduler } from '@/services/notifications/DeadlineScheduler'
import { initTabSync } from '@/services/db/tabSync'
import { syncCoordinator } from '@/services/drive/SyncCoordinator'
import { initGoogleAuth } from '@/services/drive/auth'
import Layout from '@/components/layout/Layout'

function App() {
  const theme = useUIStore((state) => state.theme)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const fetchHistory = useAIStore((state) => state.fetchHistory)
  
  usePomodoro()
  useAudio()
  useKeyboardShortcuts()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const init = async () => {
      await seedDatabase()
      await fetchTasks()
      await fetchHistory()
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (clientId) {
        initGoogleAuth(clientId)
      }

      deadlineScheduler.init()
      initTabSync()
      syncCoordinator.init()
    }
    init()
  }, [fetchTasks, fetchHistory])

  // Reschedule deadlines when tasks change
  useEffect(() => {
    deadlineScheduler.rescheduleAll()
  }, [useTaskStore.getState().tasks])

  return <Layout />
}

export default App
