import type { Task, PromptHistoryEntry, PomodoroSession } from '@/types'

export interface BackupData {
  version: number
  exportedAt: number
  tasks?: Task[]
  history?: PromptHistoryEntry[]
  sessions?: PomodoroSession[]
  settings?: any
}

export const validateBackup = (data: any): data is BackupData => {
  if (!data || typeof data !== 'object') return false
  if (typeof data.version !== 'number') return false
  if (typeof data.exportedAt !== 'number') return false
  
  if (data.tasks && !Array.isArray(data.tasks)) return false
  if (data.history && !Array.isArray(data.history)) return false
  if (data.sessions && !Array.isArray(data.sessions)) return false
  
  return true
}
