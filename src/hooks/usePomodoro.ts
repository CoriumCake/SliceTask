import { useEffect } from 'react'
import { usePomodoroStore } from '@/store/pomodoroSlice'
import { pomodoroEngine } from '@/services/pomodoro/PomodoroEngine'

export const usePomodoro = () => {
  const isRunning = usePomodoroStore((state) => state.isRunning)

  useEffect(() => {
    if (isRunning) {
      pomodoroEngine.start()
    } else {
      pomodoroEngine.stop()
    }
  }, [isRunning])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        // Force a tick or sync on tab focus
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isRunning])
}
