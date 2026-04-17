import { db } from '@/services/db/database'
import { useTaskStore } from '@/store/taskSlice'
import { useAIStore } from '@/store/aiSlice'
import { validateBackup } from './validators'

export const exportData = async () => {
  const tasks = await db.tasks.toArray()
  const history = await db.promptHistory.toArray()
  const sessions = await db.pomodoroSessions.toArray()
  
  const data = {
    version: 1,
    exportedAt: Date.now(),
    tasks,
    history,
    sessions,
    settings: {
      aiProvider: useAIStore.getState().provider,
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `slicetask-export-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const importData = async (file: File) => {
  const text = await file.text()
  const data = JSON.parse(text)

  if (!validateBackup(data)) {
    throw new Error('Invalid or corrupted backup file')
  }

  if (data.version !== 1) {
    throw new Error('Unsupported export version')
  }

  // Clear current data
  await db.tasks.clear()
  await db.promptHistory.clear()
  await db.pomodoroSessions.clear()

  // Import new data
  if (data.tasks) await db.tasks.bulkAdd(data.tasks)
  if (data.history) await db.promptHistory.bulkAdd(data.history)
  if (data.sessions) await db.pomodoroSessions.bulkAdd(data.sessions)

  // Refresh stores
  await useTaskStore.getState().fetchTasks()
  await useAIStore.getState().fetchHistory()
}
