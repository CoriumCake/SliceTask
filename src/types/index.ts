export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'inProgress' | 'done'
  priority: 'low' | 'medium' | 'high' | null
  color?: string | null
  dueDate: number | null
  columnOrder: number
  pomodoroCount: number
  sourcePromptId: string | null
  createdAt: number
  updatedAt: number
  completedAt: number | null
}

export interface PromptHistoryEntry {
  id: string
  name: string
  prompt: string
  provider: 'gemini' | 'groq'
  response: string
  generatedTaskIds: string[]
  createdAt: number
}

export interface PomodoroSession {
  id: string
  taskId: string | null
  type: 'work' | 'shortBreak' | 'longBreak'
  duration: number
  actualDuration: number
  completedAt: number
  date: string
}

export interface SyncMetaEntry {
  key: string
  value: string
}
