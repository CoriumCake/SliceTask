import { useEffect } from 'react'
import { useUIStore } from '@/store/uiSlice'
import { usePomodoroStore } from '@/store/pomodoroSlice'

export const useKeyboardShortcuts = () => {
  const { setActivePanel, selectTask, setMobileActiveTab } = useUIStore()
  const { isRunning, start, pause } = usePomodoroStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur()
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          setActivePanel('board')
          // We'd need a way to focus the AI input here
          break
        case ' ':
          e.preventDefault()
          if (isRunning) pause()
          else start()
          break
        case 'escape':
          selectTask(null)
          break
        case '1':
          setMobileActiveTab('todo')
          break
        case '2':
          setMobileActiveTab('inProgress')
          break
        case '3':
          setMobileActiveTab('done')
          break
        case 's':
          setActivePanel('settings')
          break
        case 'b':
          setActivePanel('board')
          break
        case 'h':
          setActivePanel('history')
          break
        case 'p':
          setActivePanel('pomodoro')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, start, pause, setActivePanel, selectTask, setMobileActiveTab])
}
